
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

const AdminDashboardPage = () => {
  const [statistics, setStatistics] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    uniqueAuthors: 0,
    monthlyArticles: 0
  });
  const [recentArticles, setRecentArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch dashboard data from Supabase
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Get all articles
        const { data: allArticles, error: articlesError } = await supabase
          .from("articles")
          .select("*")
          .order("updated_at", { ascending: false });

        if (articlesError) throw articlesError;

        if (allArticles) {
          // Calculate statistics
          const published = allArticles.filter(a => a.status === "published").length;
          const drafts = allArticles.filter(a => a.status === "draft").length;
          
          // Get unique authors
          const uniqueAuthors = new Set(allArticles.map(a => a.author)).size;

          // Get articles published this month
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          const monthlyArticles = allArticles.filter(article => {
            const date = new Date(article.published_at);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          }).length;

          // Set statistics
          setStatistics({
            totalArticles: allArticles.length,
            publishedArticles: published,
            draftArticles: drafts,
            uniqueAuthors,
            monthlyArticles
          });

          // Set recent articles (at most 5)
          setRecentArticles(allArticles.slice(0, 5));
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: `Gagal mengambil data: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-antlia-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard Admin</h1>
        <p className="text-gray-600">Selamat datang di panel admin ANTLIA.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Artikel
            </CardTitle>
            <FileText className="h-5 w-5 text-antlia-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statistics.totalArticles}</div>
            <p className="text-sm text-gray-600 mt-1">
              {statistics.publishedArticles} dipublikasikan, {statistics.draftArticles} draft
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Penulis
            </CardTitle>
            <Users className="h-5 w-5 text-antlia-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statistics.uniqueAuthors}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Total penulis aktif
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Bulan Ini
            </CardTitle>
            <Calendar className="h-5 w-5 text-antlia-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statistics.monthlyArticles}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Artikel dipublikasikan bulan ini
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="gradient-border">
        <CardHeader>
          <CardTitle>Artikel Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-sm text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Judul</th>
                  <th scope="col" className="px-6 py-3">Penulis</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {recentArticles.length > 0 ? (
                  recentArticles.map((article: any) => (
                    <tr key={article.id} className="bg-white border-b">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <Link to={`/admin/articles/edit/${article.id}`} className="hover:text-antlia-blue">
                          {article.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">{article.author}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          article.status === "published" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {article.status === "published" ? "Dipublikasikan" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(article.updated_at).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Belum ada artikel
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
