import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { Article } from "@/types/article";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ArticleFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = id !== undefined && id !== "new";
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{url: string, file: File}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  const emptyArticle: Article = {
    id: "",
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    author: "",
    keywords: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    status: "draft",
  };

  const [article, setArticle] = useState<Article>(emptyArticle);
  const [keywordsInput, setKeywordsInput] = useState("");

  // Rich text editor modules and formats
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'script',
    'indent', 'direction',
    'size', 'color', 'background', 'font',
    'align', 'link', 'image', 'video'
  ];

  // Fetch article data if in edit mode
  useEffect(() => {
    const fetchArticle = async () => {
      if (!isEditMode) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("articles")
          .select()
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          // Transform database article to our Article type
          const fetchedArticle: Article = {
            id: data.id,
            title: data.title,
            slug: data.slug,
            content: data.content,
            excerpt: data.excerpt,
            author: data.author,
            authorEmail: data.author_email,
            category: data.category,
            keywords: data.keywords || [],
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            publishedAt: data.published_at,
            status: data.status,
            coverImage: data.cover_image,
            readingTime: data.reading_time,
            images: data.images || []
          };

          setArticle(fetchedArticle);
          setKeywordsInput(fetchedArticle.keywords.join(", "));
          
          // If there are images in the article, add them to the uploadedImages state
          if (fetchedArticle.images && fetchedArticle.images.length > 0) {
            const imageObjects = fetchedArticle.images.map(url => ({ url, file: new File([], "") }));
            setUploadedImages(imageObjects);
          }

          // Set cover image preview if available
          if (fetchedArticle.coverImage) {
            setCoverImagePreview(fetchedArticle.coverImage);
          }
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: `Gagal mengambil data artikel: ${error.message}`,
          variant: "destructive",
        });
        navigate("/admin/articles");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id, isEditMode, navigate, toast]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setArticle({
      ...article,
      [name]: value,
    });

    // Auto-generate slug from title
    if (name === "title") {
      setArticle({
        ...article,
        title: value,
        slug: value
          .toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "-"),
      });
    }
  };

  const handleContentChange = (content: string) => {
    setArticle({
      ...article,
      content
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setArticle({
      ...article,
      [name]: value,
    });
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeywordsInput(e.target.value);
    // Split by comma and trim whitespace
    const keywordsArray = e.target.value
      .split(",")
      .map((keyword) => keyword.trim())
      .filter((keyword) => keyword.length > 0);

    setArticle({
      ...article,
      keywords: keywordsArray,
    });
  };

  // Handle reading time change separately as it's a number
  const handleReadingTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : undefined;
    setArticle({
      ...article,
      readingTime: value
    });
  };

  // Handle image upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const files = Array.from(e.target.files);
    
    try {
      for (const file of files) {
        // Create a unique filename to avoid collisions
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const filePath = `article-images/${fileName}`;
        
        // Upload to Supabase storage
        const { data, error } = await supabase.storage
          .from('articles')
          .upload(filePath, file);
          
        if (error) {
          throw error;
        }
        
        // Get the public URL for the uploaded file
        const { data: publicUrlData } = supabase.storage
          .from('articles')
          .getPublicUrl(filePath);
          
        // Add to uploaded images
        if (publicUrlData) {
          setUploadedImages((prev) => [
            ...prev, 
            { url: publicUrlData.publicUrl, file }
          ]);
        }
      }
      
      toast({
        title: "Berhasil",
        description: "Gambar berhasil diunggah",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal mengunggah gambar: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle cover image upload
  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploadingCover(true);
    const file = e.target.files[0];
    
    try {
      // Create preview for the UI
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setCoverImagePreview(event.target.result);
        }
      };
      reader.readAsDataURL(file);
      
      // Create a unique filename to avoid collisions
      const fileName = `cover-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const filePath = `article-covers/${fileName}`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('articles')
        .upload(filePath, file);
        
      if (error) {
        throw error;
      }
      
      // Get the public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('articles')
        .getPublicUrl(filePath);
        
      // Set the cover image URL in the article state
      if (publicUrlData) {
        setArticle({
          ...article,
          coverImage: publicUrlData.publicUrl
        });
        
        toast({
          title: "Berhasil",
          description: "Cover gambar berhasil diunggah",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal mengunggah cover gambar: ${error.message}`,
        variant: "destructive",
      });
      // Reset preview if upload failed
      setCoverImagePreview(article.coverImage || null);
    } finally {
      setUploadingCover(false);
      if (coverImageInputRef.current) {
        coverImageInputRef.current.value = '';
      }
    }
  };

  // Remove uploaded image
  const removeImage = (index: number) => {
    setUploadedImages((prev) => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Remove cover image
  const removeCoverImage = () => {
    setArticle({
      ...article,
      coverImage: undefined
    });
    setCoverImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Get image URLs from uploadedImages state
      const imageUrls = uploadedImages.map(img => img.url);
      
      // Prepare data for Supabase - convert our Article type to database format
      const articleData = {
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        author: article.author,
        author_email: article.authorEmail,
        keywords: article.keywords,
        category: article.category,
        reading_time: article.readingTime,
        cover_image: article.coverImage,
        status: article.status,
        published_at: new Date(article.publishedAt).toISOString(),
        images: imageUrls
      };

      let result;
      
      if (isEditMode) {
        // Update existing article
        result = await supabase
          .from("articles")
          .update(articleData)
          .eq("id", article.id);
      } else {
        // Insert new article
        result = await supabase
          .from("articles")
          .insert([articleData]);
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: `Artikel berhasil ${isEditMode ? "diperbarui" : "dibuat"}`,
        description: `Artikel "${article.title}" telah ${isEditMode ? "diperbarui" : "dibuat"}.`,
        variant: "default",
      });
      
      navigate("/admin/articles");
    } catch (error: any) {
      toast({
        title: `Gagal ${isEditMode ? "memperbarui" : "membuat"} artikel`,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-antlia-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/articles")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditMode ? "Edit Artikel" : "Artikel Baru"}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList>
            <TabsTrigger value="content">Konten</TabsTrigger>
            <TabsTrigger value="meta">Meta & SEO</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Artikel</CardTitle>
                <CardDescription>
                  Masukkan informasi dasar artikel.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Judul artikel"
                    value={article.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug URL</Label>
                  <Input
                    id="slug"
                    name="slug"
                    placeholder="slug-url-artikel"
                    value={article.slug}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    URL: /artikel/{article.slug}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Ringkasan</Label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    placeholder="Ringkasan singkat artikel (akan ditampilkan di daftar artikel)"
                    value={article.excerpt}
                    onChange={handleInputChange}
                    required
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Konten Artikel</Label>
                  <div className="min-h-[300px] border rounded-md">
                    <ReactQuill 
                      theme="snow"
                      value={article.content} 
                      onChange={handleContentChange}
                      modules={modules}
                      formats={formats}
                      placeholder="Tulis konten artikel di sini..."
                      className="h-64"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Gunakan editor di atas untuk mengatur teks (bold, italic, dll) dan menambahkan gambar.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Cover Image Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Cover Image</CardTitle>
                <CardDescription>
                  Upload gambar utama untuk artikel ini
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <input
                    type="file"
                    id="coverImage"
                    ref={coverImageInputRef}
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                  />
                  
                  {/* Cover image preview */}
                  {coverImagePreview ? (
                    <div className="relative">
                      <img 
                        src={coverImagePreview} 
                        alt="Cover Preview" 
                        className="w-full h-48 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={removeCoverImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => coverImageInputRef.current?.click()}
                      disabled={uploadingCover}
                      className="w-full py-8 border-dashed"
                    >
                      {uploadingCover ? (
                        <div className="flex items-center">
                          <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-antlia-blue rounded-full"></div>
                          <span>Mengupload cover...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="h-8 w-8 mb-2 text-gray-400" />
                          <span>Klik untuk upload cover image</span>
                          <span className="text-xs text-gray-500">
                            Pilih gambar dari device Anda
                          </span>
                        </div>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload Gambar</CardTitle>
                <CardDescription>
                  Upload gambar tambahan untuk artikel ini
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <input
                    type="file"
                    id="images"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    multiple
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full py-8 border-dashed"
                  >
                    {isUploading ? (
                      <div className="flex items-center">
                        <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-antlia-blue rounded-full"></div>
                        <span>Mengupload...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="h-8 w-8 mb-2 text-gray-400" />
                        <span>Klik untuk upload gambar</span>
                        <span className="text-xs text-gray-500">
                          Atau drag dan drop file di sini
                        </span>
                      </div>
                    )}
                  </Button>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Gambar yang telah diunggah:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url}
                            alt={`Uploaded ${index + 1}`}
                            className="h-24 w-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="mt-1 text-xs truncate">{image.file.name || `Image ${index + 1}`}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Anda dapat menyisipkan URL gambar ini ke dalam konten artikel.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status dan Kategori</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status Publikasi</Label>
                    <Select
                      value={article.status}
                      onValueChange={(value) =>
                        handleSelectChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Dipublikasikan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <Select
                      value={article.category || ""}
                      onValueChange={(value) =>
                        handleSelectChange("category", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Teknologi">Teknologi</SelectItem>
                        <SelectItem value="Bisnis">Bisnis</SelectItem>
                        <SelectItem value="Keamanan">Keamanan</SelectItem>
                        <SelectItem value="Inovasi">Inovasi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meta & SEO Tab - keeping existing code */}
          <TabsContent value="meta" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Penulis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="author">Nama Penulis</Label>
                    <Input
                      id="author"
                      name="author"
                      placeholder="Nama penulis"
                      value={article.author}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="authorEmail">Email Penulis</Label>
                    <Input
                      id="authorEmail"
                      name="authorEmail"
                      type="email"
                      placeholder="Email penulis"
                      value={article.authorEmail || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO & Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    placeholder="Kata kunci dipisahkan dengan koma"
                    value={keywordsInput}
                    onChange={handleKeywordsChange}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {article.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-antlia-light text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="readingTime">Waktu Baca (menit)</Label>
                  <Input
                    id="readingTime"
                    name="readingTime"
                    type="number"
                    placeholder="Waktu baca dalam menit"
                    value={article.readingTime || ""}
                    onChange={handleReadingTimeChange}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publishedAt">Tanggal Publikasi</Label>
                  <Input
                    id="publishedAt"
                    name="publishedAt"
                    type="datetime-local"
                    value={new Date(article.publishedAt).toISOString().slice(0, 16)}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverImage">URL Gambar Cover</Label>
                  <Input
                    id="coverImage"
                    name="coverImage"
                    placeholder="https://example.com/image.jpg"
                    value={article.coverImage || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab - updating to show cover image preview */}
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Preview Artikel</CardTitle>
                <CardDescription>
                  Pratinjau bagaimana artikel akan ditampilkan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cover image preview */}
                {coverImagePreview && (
                  <div className="w-full h-48 md:h-64 overflow-hidden rounded-md mb-4">
                    <img 
                      src={coverImagePreview} 
                      alt="Cover Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="border-b pb-4">
                  <h2 className="text-2xl font-bold mb-2">{article.title || "Judul Artikel"}</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    {article.category && (
                      <>
                        <span className="bg-antlia-blue/10 text-antlia-blue px-3 py-1 rounded-full">
                          {article.category}
                        </span>
                        <span>•</span>
                      </>
                    )}
                    <time dateTime={article.publishedAt}>
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </time>
                    {article.readingTime && (
                      <>
                        <span>•</span>
                        <span>{article.readingTime} min read</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-antlia-purple rounded-full flex items-center justify-center text-white">
                    {article.author ? article.author.charAt(0) : "A"}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{article.author || "Nama Penulis"}</p>
                    {article.authorEmail && (
                      <p className="text-sm text-gray-600">{article.authorEmail}</p>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{article.excerpt || "Ringkasan artikel akan ditampilkan di sini."}</p>
                </div>
                
                {/* Display uploaded images in the preview */}
                {uploadedImages.length > 0 && (
                  <div className="my-4">
                    <h3 className="text-lg font-semibold mb-2">Gambar Artikel</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {uploadedImages.map((image, index) => (
                        <img
                          key={index}
                          src={image.url}
                          alt={`Article image ${index + 1}`}
                          className="rounded-md shadow-sm"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="prose max-w-none">
                  {article.content ? (
                    <div dangerouslySetInnerHTML={{ __html: article.content }} />
                  ) : (
                    <p className="text-gray-500 italic">Konten artikel akan ditampilkan di sini.</p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {article.keywords.length > 0 ? (
                    article.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-antlia-light text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        #{keyword}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">Keywords akan ditampilkan di sini.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/articles")}
          >
            Batal
          </Button>
          <Button 
            type="submit" 
            className="bg-antlia-blue hover:bg-blue-600"
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Menyimpan..." : "Simpan Artikel"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ArticleFormPage;
