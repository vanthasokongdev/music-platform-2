import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { Music } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"artist" | "arranger" | "engineer">("artist");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLng = i18n.language?.startsWith("ja") ? "ja" : "en";
  const toggleLanguage = () => i18n.changeLanguage(currentLng === "en" ? "ja" : "en");

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: displayName,
            role: role,
          },
        },
      });

      if (error) throw error;

      if (data.user && !data.session) {
        toast({
          title: t("auth.verifyEmailTitle"),
          description: t("auth.verifyEmailDesc"),
        });
      } else {
        toast({
          title: t("auth.welcomeTitle"),
          description: t("auth.welcomeDesc"),
        });
        navigate("/");
      }
    } catch (error: any) {
      setError(error.message);
      toast({
        title: t("auth.signUpFailed"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: t("auth.signedInTitle"),
        description: t("auth.signedInDesc"),
      });
      navigate("/");
    } catch (error: any) {
      setError(error.message);
      toast({
        title: t("auth.signInFailed"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center relative">
          <div className="absolute right-4 top-4">
            <Button size="sm" variant="secondary" onClick={toggleLanguage}>
              {t("lang.switch")} ({currentLng === "en" ? t("lang.ja") : t("lang.en")})
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Music className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">MusicSync</h1>
          </div>
          <CardTitle>{t("auth.title")}</CardTitle>
          <CardDescription>
            {t("auth.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{t("auth.signInTab")}</TabsTrigger>
              <TabsTrigger value="signup">{t("auth.signUpTab")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">{t("auth.email")}</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder") || undefined}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">{t("auth.password")}</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder={t("auth.passwordPlaceholder") || undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t("auth.signingIn") : t("auth.signIn")}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">{t("auth.displayName")}</Label>
                  <Input
                    id="display-name"
                    type="text"
                    placeholder={t("auth.displayNamePlaceholder") || undefined}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">{t("profile.role.label")}</Label>
                  <Select value={role} onValueChange={(value: "artist" | "arranger" | "engineer") => setRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("auth.rolePlaceholder") || undefined} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="artist">{t("profile.role.artist")}</SelectItem>
                      <SelectItem value="arranger">{t("profile.role.arranger")}</SelectItem>
                      <SelectItem value="engineer">{t("profile.role.engineer")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t("auth.email")}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder") || undefined}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t("auth.password")}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder={t("auth.passwordPlaceholder") || undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="bg-muted/50 p-3 rounded-lg text-sm">
                  <p className="text-muted-foreground">
                    {t("auth.notice")}
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t("auth.creatingAccount") : t("auth.createAccount")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
