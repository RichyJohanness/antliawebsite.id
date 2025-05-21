
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/types/article";
import { useToast } from "@/components/ui/use-toast";

const ArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  // Fetch articles from Supabase
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("status", "published")
          .order("published_at", { ascending: false }); // Order by published_at to get latest

        if (error) {
          throw error;
        }

        if (data) {
          const mappedArticles: Article[] = data.map(article => ({
            id: article.id,
            title: article.title,
            slug: article.slug,
            content: article.content,
            excerpt: article.excerpt,
            author: article.author,
            authorEmail: article.author_email,
            category: article.category,
            keywords: article.keywords || [],
            createdAt: article.created_at,
            updatedAt: article.updated_at,
            publishedAt: article.published_at,
            coverImage: article.cover_image,
            status: article.status,
            readingTime: article.reading_time,
            images: article.images || []
          }));
          
          setArticles(mappedArticles);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: `Gagal mengambil data artikel: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [toast]);

  // Filter articles based on search term
  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.keywords.some(keyword => 
      keyword.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2 text-center font-playfair">Artikel</h1>
      <p className="text-gray-600 mb-8 text-center font-manrope text-sm">
        Temukan artikel terbaru dan wawasan dari tim ANTLIA
      </p>
      
      <div className="mb-8">
        <input
          type="text"
          placeholder="Cari artikel..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-antlia-blue font-manrope text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-antlia-blue"></div>
          <p className="mt-4 text-gray-600 font-manrope text-sm">Memuat artikel...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600 font-manrope">Tidak ada artikel yang ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <Card 
              key={article.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow gradient-border"
            >
              <CardHeader className="p-0">
                <div className="h-48 bg-antlia-light flex items-center justify-center">
                  {article.coverImage ? (
                    <img 
                      src={article.coverImage} 
                      alt={article.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 text-antlia-blue">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" 
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500 font-manrope">{new Date(article.publishedAt).toLocaleDateString('id-ID')}</span>
                  {article.category && (
                    <span className="inline-block bg-antlia-blue/10 text-antlia-blue px-2 py-1 text-xs rounded-full font-manrope">
                      {article.category}
                    </span>
                  )}
                </div>
                <Link to={`/artikel/${article.slug}`}>
                  <h3 className="text-lg font-bold mb-2 hover:text-antlia-blue transition-colors font-playfair">
                    {article.title}
                  </h3>
                </Link>
                <p className="text-gray-600 line-clamp-3 text-sm font-manrope">{article.excerpt}</p>
              </CardContent>
              <CardFooter className="flex items-center justify-between pt-0">
                <div className="flex items-center">
                  <div className="w-7 h-7 bg-antlia-purple rounded-full flex items-center justify-center text-white">
                    {article.author.charAt(0)}
                  </div>
                  <span className="text-xs ml-2 text-gray-700 font-manrope">{article.author}</span>
                </div>
                {article.readingTime && (
                  <span className="text-xs text-gray-500 font-manrope">{article.readingTime} min read</span>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticlesPage;
