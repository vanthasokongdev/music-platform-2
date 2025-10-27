import { ReactNode } from "react";
import Navigation from "./Navigation";
import { useAuth } from "@/hooks/useAuth";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { profile } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation userRole={profile?.role || "artist"} />
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;