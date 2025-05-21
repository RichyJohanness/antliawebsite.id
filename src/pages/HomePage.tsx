import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { ChevronRight, Phone, Mail, ArrowRight, CheckCircle } from "lucide-react";
import HeroCarousel from "@/components/HeroCarousel";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSlider from "@/components/TestimonialsSlider";
import LogoMarquee from "@/components/LogoMarquee";
import FeatureCard from "@/components/FeatureCard";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import TeamSection from "@/components/TeamSection";
import { Article } from "@/types/article";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const partners = [
  { id: 1, name: "Company A", logo: "/assets/partner-1.png" },
  { id: 2, name: "Company B", logo: "/assets/partner-2.png" },
  { id: 3, name: "Company C", logo: "/assets/partner-3.png" },
  { id: 4, name: "Company D", logo: "/assets/partner-4.png" },
  { id: 5, name: "Company E", logo: "/assets/partner-5.png" },
  { id: 6, name: "Company F", logo: "/assets/partner-6.png" },
];

const teamMembers = [
  {
    name: "Ahmad Rasyid",
    position: "CEO & Founder",
    image: "/assets/team-1.jpg",
    bio: "Memiliki pengalaman 15 tahun di industri teknologi informasi dengan fokus pada solusi enterprise.",
    linkedin: "https://linkedin.com",
    email: "ahmad@antlia.id"
  },
  {
    name: "Siti Nuraini",
    position: "CTO",
    image: "/assets/team-2.jpg",
    bio: "Ahli teknologi dengan spesialisasi di cloud computing dan arsitektur sistem terdistribusi.",
    linkedin: "https://linkedin.com",
    email: "siti@antlia.id"
  },
  {
    name: "Budi Santoso",
    position: "Lead Developer",
    image: "/assets/team-3.jpg",
    bio: "Pengembang senior dengan keahlian di berbagai bahasa pemrograman dan framework modern.",
    linkedin: "https://linkedin.com",
    email: "budi@antlia.id"
  },
  {
    name: "Maya Putri",
    position: "UX Design Lead",
    image: "/assets/team-4.jpg",
    bio: "Desainer UX berpengalaman dengan fokus pada menciptakan pengalaman digital yang intuitif dan efisien.",
    linkedin: "https://linkedin.com",
    email: "maya@antlia.id"
  }
];

const HomePage = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  
  // Fetch latest articles from Supabase
  useEffect(() => {
    const fetchLatestArticles = async () => {
      try {
        setIsLoadingArticles(true);
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(3);

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
          
          setLatestArticles(mappedArticles);
        }
      } catch (error: any) {
        console.error("Error fetching latest articles:", error);
        toast({
          title: "Error",
          description: `Gagal mengambil artikel terbaru: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setIsLoadingArticles(false);
      }
    };

    fetchLatestArticles();
  }, [toast]);
  
  useEffect(() => {
    // Initialize AOS-like animations
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });
    
    animatedElements.forEach(el => {
      observer.observe(el);
    });
    
    return () => {
      animatedElements.forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <div className="flex flex-col w-full">
      <HeroCarousel />
      
      {/* Value Proposition Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-on-scroll">
            <span className="subtitle block mb-2">Why Choose Us</span>
            <h2 className="text-3xl font-bold mb-4">Mengapa Memilih ANTLIA?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              ANTLIA menyediakan solusi teknologi terbaik untuk membantu bisnis Anda
              berkembang di era digital. Kami menggabungkan keahlian teknologi dengan
              pemahaman bisnis yang mendalam.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Keahlian Teknis" 
              description="Tim ahli kami memiliki pengalaman luas dalam berbagai teknologi terkini"
              icon="CheckCircle"
              delay={100}
            />
            <FeatureCard 
              title="Solusi Kustom" 
              description="Kami membangun solusi yang disesuaikan dengan kebutuhan spesifik bisnis Anda"
              icon="CheckCircle" 
              delay={200}
            />
            <FeatureCard 
              title="Dukungan 24/7" 
              description="Layanan dukungan teknis tersedia 24 jam setiap hari untuk memastikan bisnis Anda selalu berjalan lancar"
              icon="CheckCircle"
              delay={300}
            />
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <ServicesSection />
      
      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-on-scroll">
            <span className="subtitle block mb-2">Our Products</span>
            <h2 className="text-3xl font-bold mb-4">Produk Unggulan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Solusi perangkat lunak terbaik untuk membantu bisnis Anda berkembang dan bersaing
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "ANTLIA CRM",
                description: "Sistem manajemen pelanggan komprehensif dengan fitur otomatisasi dan analitik",
                image: "/assets/product-1.jpg"
              },
              {
                title: "ANTLIA ERP",
                description: "Solusi Enterprise Resource Planning terintegrasi untuk efisiensi operasional bisnis",
                image: "/assets/product-2.jpg"
              },
              {
                title: "ANTLIA Analytics",
                description: "Platform analitik data untuk mengubah data mentah menjadi wawasan bisnis yang berharga",
                image: "/assets/product-3.jpg"
              }
            ].map((product, index) => (
              <Card key={index} className="product-card overflow-hidden animate-on-scroll" style={{animationDelay: `${index * 100}ms`}}>
                <div className="h-52 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="product-overlay">
                    <h3 className="text-xl font-bold mb-2">{product.title}</h3>
                    <Button className="mt-4 bg-antlia-blue hover:bg-antlia-blue/80">
                      <Link to="/produk-layanan">Lihat Detail</Link>
                    </Button>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <Link 
                    to="/produk-layanan" 
                    className="text-antlia-blue hover:underline flex items-center font-medium"
                  >
                    Lihat Detail <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-10 animate-on-scroll">
            <Button className="bg-antlia-blue hover:bg-antlia-blue/80">
              <Link to="/produk-layanan" className="flex items-center">
                Lihat Semua Produk <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <TeamSection 
        title="Tim Ahli Kami" 
        subtitle="Meet Our Experts"
        description="Didukung oleh profesional berpengalaman yang berdedikasi untuk memberikan yang terbaik"
        members={teamMembers}
      />
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-antlia-blue/10 to-antlia-cyan/10">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 relative overflow-hidden animate-on-scroll">
            <div className="absolute top-0 right-0 w-64 h-64 bg-antlia-blue/10 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-antlia-cyan/10 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
              <div className="mb-8 md:mb-0 md:mr-8 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-4">Siap untuk Transformasi Digital?</h2>
                <p className="text-gray-600 mb-6 max-w-xl">
                  Mari diskusikan bagaimana ANTLIA dapat membantu bisnis Anda berkembang
                  melalui solusi teknologi yang inovatif dan efisien.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Button className="bg-antlia-blue hover:bg-antlia-blue/80">
                    <Link to="/kontak" className="flex items-center">
                      Hubungi Kami <ArrowRight size={16} className="ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="border-antlia-blue text-antlia-blue hover:bg-antlia-blue/10">
                    <a 
                      href="https://wa.me/6281573635143" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      WhatsApp <Phone size={16} className="ml-2" />
                    </a>
                  </Button>
                </div>
              </div>
              <div className="w-full md:w-1/3">
                <img 
                  src="/assets/cta-image.png" 
                  alt="Digital Transformation" 
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <TestimonialsSlider />
      
      {/* Partner Logos */}
      <LogoMarquee logos={partners} />
      
      {/* Blog Preview Section - Updated to use real articles from Supabase */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-on-scroll">
            <span className="subtitle block mb-2">Latest Updates</span>
            <h2 className="text-3xl font-bold mb-4">Artikel Terbaru</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Temukan informasi terbaru seputar teknologi dan inovasi digital
              di blog ANTLIA.
            </p>
          </div>
          
          {isLoadingArticles ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-antlia-blue"></div>
            </div>
          ) : latestArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestArticles.map((article, index) => (
                <div key={article.id} className="gradient-border rounded-lg overflow-hidden">
                  <Card className="border-0 h-full animate-on-scroll" style={{animationDelay: `${index * 100}ms`}}>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                      <CardDescription>
                        {new Date(article.publishedAt).toLocaleDateString('id-ID')}
                        {article.category && (
                          <span className="inline-block bg-antlia-blue/10 text-antlia-blue px-2 py-1 text-xs rounded-full ml-2">
                            {article.category}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 overflow-hidden rounded-md mb-4">
                        {article.coverImage ? (
                          <img 
                            src={article.coverImage} 
                            alt={article.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-antlia-light/30 flex items-center justify-center">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="h-16 w-16 text-antlia-blue/50"
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 line-clamp-3">
                        {article.excerpt}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link to={`/artikel/${article.slug}`} className="text-antlia-blue hover:underline flex items-center">
                        Baca selengkapnya <ChevronRight className="ml-1 w-4 h-4" />
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Belum ada artikel yang dipublikasikan</p>
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button variant="outline" asChild>
              <Link to="/artikel" className="flex items-center">
                Lihat Semua Artikel <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
