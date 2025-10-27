import { NavLink } from "react-router-dom";
import { Home, Upload, Users, TrendingUp, Music, MessageSquare, Search, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface NavigationProps {
  userRole: string;
}

const Navigation = ({ userRole }: NavigationProps) => {
  const { signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const currentLng = i18n.language?.startsWith("ja") ? "ja" : "en";
  const toggleLanguage = () => i18n.changeLanguage(currentLng === "en" ? "ja" : "en");
  
  const getNavItems = (role: string) => {
    if (role === 'artist') {
      return [
        { to: "/upload", label: t("nav.upload"), icon: Upload },
        { to: "/search", label: t("nav.search"), icon: Search },
        { to: "/rooms", label: t("nav.rooms"), icon: MessageSquare },
      ];
    }

    if (role === 'arranger' || role === 'engineer') {
      return [
        { to: "/profile", label: t("nav.profile"), icon: Users },
        { to: "/search", label: t("nav.search"), icon: Search },
        { to: "/rooms", label: t("nav.rooms"), icon: MessageSquare },
      ];
    }

    if (role === 'admin') {
      return [
        { to: "/", label: t("nav.dashboard"), icon: Home },
        { to: "/demo-review", label: t("nav.demoReview"), icon: Music },
        { to: "/coordination", label: t("nav.coordination"), icon: Users },
        { to: "/rooms", label: t("nav.allRooms"), icon: MessageSquare },
        { to: "/analytics", label: t("nav.analytics"), icon: TrendingUp },
        { to: "/settings", label: t("nav.settings"), icon: Settings },
      ];
    }

    return [];
  };

  const navItems = getNavItems(userRole);

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6 z-50">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-neon bg-clip-text text-transparent">
          {t("brand")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("tagline")}</p>
      </div>
      
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
                  "hover:bg-secondary hover:shadow-card",
                  isActive
                    ? "bg-gradient-neon text-primary-foreground shadow-neon"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="absolute bottom-6 left-6 right-6 space-y-3">
        <Button
          onClick={toggleLanguage}
          variant="secondary"
          size="sm"
          className="w-full"
        >
          {t("lang.switch")} ({currentLng === "en" ? t("lang.ja") : t("lang.en")})
        </Button>
        <Button
          onClick={signOut}
          variant="outline"
          size="sm"
          className="w-full flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          {t("nav.logout")}
        </Button>
        <div className="p-4 rounded-lg bg-gradient-subtle border border-glass-border backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-2">{t("nav.help")}</p>
          <button className="text-sm text-accent hover:text-accent/80 transition-colors">
            {t("nav.contact")}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
