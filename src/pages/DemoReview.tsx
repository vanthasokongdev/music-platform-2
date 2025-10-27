import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, Pause, CheckCircle, XCircle, Clock, User } from "lucide-react";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface DemoTrack {
  id: string;
  title: string;
  genre: string;
  description?: string;
  audio_url: string;
  status: string;
  submitted_at: string;
  feedback?: string;
  profiles: {
    id: string;
    display_name: string;
    avatar_url?: string;
  } | null;
}

const DemoReview = () => {
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [demos, setDemos] = useState<DemoTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    fetchDemos();
  }, []);

  const fetchDemos = async () => {
    try {
      const { data, error } = await supabase
        .from('demo_tracks')
        .select(`
          *,
          profiles!inner(
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      setDemos((data as any) || []);
    } catch (error) {
      console.error('Error fetching demos:', error);
      toast({
        title: t("common.error"),
        description: t("demoReview.loadFailed"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (demoId: string) => {
    try {
      const { error } = await supabase
        .from('demo_tracks')
        .update({
          status: 'approved',
          feedback: feedback,
          reviewed_at: new Date().toISOString(),
          reviewed_by: profile?.id
        })
        .eq('id', demoId);

      if (error) throw error;

      toast({
        title: t("demoReview.approvedTitle"),
        description: t("demoReview.approvedDesc"),
      });

      // Refresh the list
      fetchDemos();
      setSelectedDemo(null);
      setFeedback("");
    } catch (error) {
      console.error('Error approving demo:', error);
      toast({
        title: t("common.error"),
        description: t("demoReview.approveFailed"),
        variant: "destructive",
      });
    }
  };

  const handleReject = async (demoId: string) => {
    try {
      const { error } = await supabase
        .from('demo_tracks')
        .update({
          status: 'rejected',
          feedback: feedback,
          reviewed_at: new Date().toISOString(),
          reviewed_by: profile?.id
        })
        .eq('id', demoId);

      if (error) throw error;

      toast({
        title: t("demoReview.rejectedTitle"),
        description: t("demoReview.rejectedDesc"),
      });

      // Refresh the list
      fetchDemos();
      setSelectedDemo(null);
      setFeedback("");
    } catch (error) {
      console.error('Error rejecting demo:', error);
      toast({
        title: t("common.error"),
        description: t("demoReview.rejectFailed"),
        variant: "destructive",
      });
    }
  };

  const getAudioUrl = (audioPath: string) => {
    const { data } = supabase.storage
      .from('demo-tracks')
      .getPublicUrl(audioPath);
    return data.publicUrl;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

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

  const selectedDemoData = demos.find(demo => demo.id === selectedDemo);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t("demoReview.title")}</h1>
        <p className="text-muted-foreground">{t("demoReview.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("demoReview.pendingList", { count: demos.length })}</CardTitle>
            <CardDescription>
              {t("demoReview.pendingHelp")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {demos.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">{t("demoReview.noPending")}</p>
              ) : (
                demos.map((demo) => (
                  <div
                    key={demo.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedDemo === demo.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedDemo(demo.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{demo.title}</h3>
                          <Badge variant="secondary">{demo.genre}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {t("demoReview.artist")}: {demo.profiles?.display_name || t("demoReview.unknown")}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(demo.submitted_at)}
                          </span>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {t("demoReview.pending")}
                          </Badge>
                        </div>
                        <WaveformVisualizer />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPlaying(!isPlaying);
                        }}
                      >
                        {isPlaying && selectedDemo === demo.id ? 
                          <Pause className="w-4 h-4" /> : 
                          <Play className="w-4 h-4" />
                        }
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {selectedDemoData ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{t("demoReview.reviewing", { title: selectedDemoData.title })}</CardTitle>
                  <CardDescription>{t("demoReview.enterFeedback")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{t("demoReview.feedback")}</h4>
                    <Textarea
                      placeholder={t("demoReview.feedbackPlaceholder") || undefined}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleApprove(selectedDemoData.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t("demoReview.approve")}
                    </Button>
                    <Button 
                      onClick={() => handleReject(selectedDemoData.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {t("demoReview.reject")}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("demoReview.artistProfile")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={selectedDemoData.profiles?.avatar_url || ""} />
                      <AvatarFallback>
                        <User className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium">{selectedDemoData.profiles?.display_name || t("demoReview.unknown")}</h3>
                      <p className="text-sm text-muted-foreground">{t("demoReview.artist")}</p>
                      {selectedDemoData.description && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium mb-1">{t("demoReview.aboutSong")}</h4>
                          <p className="text-sm text-muted-foreground">{selectedDemoData.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t("demoReview.selectPrompt")}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoReview;
