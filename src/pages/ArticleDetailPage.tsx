
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/types/article";
import { useToast } from "@/components/ui/use-toast";

const ArticleDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("slug", slug)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setArticle({
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
            coverImage: data.cover_image,
            status: data.status,
            readingTime: data.reading_time,
            images: data.images || [] // Ensure images array is available
          });
          
          console.log("Article fetched:", data);
          console.log("Images:", data.images);
        }
      } catch (error: any) {
        if (error.code === 'PGRST116') {
          // Not found, handle silently as we'll show a not found message
        } else {
          toast({
            title: "Error",
            description: `Gagal mengambil artikel: ${error.message}`,
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug, toast]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-antlia-blue"></div>
        <p className="mt-4 text-gray-600 body-sm">Memuat artikel...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="heading-md mb-4">Artikel tidak ditemukan</h1>
        <p className="mb-8 body-sm">Artikel yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Button 
          onClick={() => navigate("/artikel")}
          className="bg-antlia-blue hover:bg-blue-600 body-sm"
        >
          Kembali ke Daftar Artikel
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <Link to="/artikel" className="inline-flex items-center text-antlia-blue mb-6 hover:underline body-sm">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Kembali ke Daftar Artikel
      </Link>
      
      <div className="gradient-border-container">
        <header className="mb-8">
          <div className="flex items-center space-x-2 text-xs text-gray-600 mb-2 body-sm">
            {article.category && (
              <>
                <span className="bg-antlia-blue/10 text-antlia-blue px-3 py-1 rounded-full">
                  {article.category}
                </span>
                <span>•</span>
              </>
            )}
            <time dateTime={article.publishedAt}>
              {new Date(article.publishedAt).toLocaleDateString('id-ID', { 
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </time>
            {article.readingTime && (
              <>
                <span>•</span>
                <span>{article.readingTime} min read</span>
              </>
            )}
          </div>
          
          <h1 className="heading-lg mb-4">{article.title}</h1>
          
          <div className="flex items-center">
            <div className="w-9 h-9 bg-antlia-purple rounded-full flex items-center justify-center text-white">
              {article.authorPhoto ? (
                <img 
                  src={article.authorPhoto} 
                  alt={article.author} 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                article.author.charAt(0)
              )}
            </div>
            <div className="ml-3">
              <p className="font-medium body-sm">{article.author}</p>
              {article.authorEmail && (
                <p className="text-xs text-gray-600">{article.authorEmail}</p>
              )}
            </div>
          </div>
        </header>
        
        {article.coverImage && (
          <div className="mb-8">
            <img 
              src={article.coverImage} 
              alt={article.title} 
              className="w-full h-auto max-h-[500px] object-cover rounded-lg"
            />
          </div>
        )}
        
        <div 
          className="prose prose-sm max-w-none body-md"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        
        {/* Display article images in a gallery with gradient borders */}
        {article.images && article.images.length > 0 && (
          <div className="mt-10 mb-8">
            <h3 className="heading-sm mb-4">Galeri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {article.images.map((imageUrl, index) => (
                <div key={index} className="gradient-border rounded-lg overflow-hidden">
                  <div>
                    <img 
                      src={imageUrl} 
                      alt={`${article.title} - Gambar ${index + 1}`}
                      className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <footer className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {article.keywords.map((keyword) => (
              <span 
                key={keyword} 
                className="bg-antlia-light text-gray-700 px-3 py-1 rounded-full text-xs"
              >
                #{keyword}
              </span>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ArticleDetailPage;
