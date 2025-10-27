import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import { Upload, TrendingUp, Users, Music, Clock, UserPlus, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { NavLink } from "react-router-dom";

const Dashboard = () => {
  const { profile } = useAuth();
  const { t } = useTranslation();

  // Mock data for admin overview
  const pendingDemos = [
    { title: "City Lights", artist: "Ava S.", genre: "Pop", submittedAt: "2025-10-20" },
    { title: "Neon Pulse", artist: "Kenji T.", genre: "Electronic", submittedAt: "2025-10-21" },
    { title: "Low Tide", artist: "Mika R.", genre: "Ambient", submittedAt: "2025-10-22" },
  ];

  const newAccounts = [
    { name: "Haru K.", role: "artist", createdAt: "2025-10-21" },
    { name: "Rina S.", role: "arranger", createdAt: "2025-10-20" },
    { name: "Leo M.", role: "engineer", createdAt: "2025-10-19" },
  ];

  // Non-admin users should not see the admin dashboard
  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">{t("demoReview.accessDenied")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">{t("dashboard.adminTitle")}</h1>
          <p className="text-muted-foreground">{t("dashboard.adminSubtitle")}</p>
        </div>
        <NavLink to="/demo-review">
          <Button className="bg-gradient-neon hover:shadow-neon transition-all duration-300">
            <Upload className="w-4 h-4 mr-2" />
            {t("dashboard.reviewNow")}
          </Button>
        </NavLink>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> {t("dashboard.pendingDemos")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{pendingDemos.length}</div>
            <p className="text-xs text-accent">{t("dashboard.thisWeekChange", { count: 1 })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> {t("dashboard.newAccounts")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{newAccounts.length}</div>
            <p className="text-xs text-accent">{t("dashboard.thisWeekChange", { count: 3 })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" /> {t("dashboard.collaborations")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">8</div>
            <p className="text-xs text-accent">{t("dashboard.pendingReviews", { count: 3 })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> {t("dashboard.streams")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">15.2K</div>
            <p className="text-xs text-accent">{t("dashboard.thisWeekChange", { count: "1.8K" })}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Demos */}
        <Card className="bg-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              {t("dashboard.pendingDemos")} ({pendingDemos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingDemos.map((demo, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{demo.title}</h4>
                      <Badge variant="secondary" className="text-xs">{demo.genre}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{demo.artist}</p>
                    <div className="mt-2">
                      <WaveformVisualizer className="w-32 h-6" />
                    </div>
                  </div>
                  <NavLink to="/demo-review" className="text-accent text-sm flex items-center gap-1">
                    {t("dashboard.reviewNow")} <ArrowRight className="w-3 h-3" />
                  </NavLink>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* New Accounts */}
        <Card className="bg-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              {t("dashboard.newAccounts")} ({newAccounts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {newAccounts.map((acc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <div className="font-medium text-foreground">{acc.name}</div>
                  <div className="text-xs text-muted-foreground">{acc.role} • {acc.createdAt}</div>
                </div>
                <NavLink to="/search" className="text-accent text-sm flex items-center gap-1">
                  {t("dashboard.viewAll")} <ArrowRight className="w-3 h-3" />
                </NavLink>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
