import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Upload as UploadIcon, Music, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const Upload = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isDemo, setIsDemo] = useState(true);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const { user, profile } = useAuth();

  const { t } = useTranslation();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('audio/')) {
        setAudioFile(file);
        setIsUploaded(true);
      } else {
        toast({
          title: t("upload.invalidFileTitle"),
          description: t("upload.invalidFileDesc"),
          variant: "destructive",
        });
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('audio/')) {
        setAudioFile(file);
        setIsUploaded(true);
      } else {
        toast({
          title: t("upload.invalidFileTitle"),
          description: t("upload.invalidFileDesc"),
          variant: "destructive",
        });
      }
    }
  };

  const uploadToStorage = async (file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('demo-tracks')
      .upload(fileName, file);

    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }

    return fileName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!audioFile || !profile || !user) {
      toast({
        title: t("common.error"),
        description: t("upload.loginSelectFile"),
        variant: "destructive",
      });
      return;
    }

    if (profile.role !== 'artist') {
      toast({
        title: t("common.accessDenied"),
        description: t("upload.artistOnly"),
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Upload file to storage
      const audioUrl = await uploadToStorage(audioFile);
      
      if (!audioUrl) {
        throw new Error(t("upload.fileUploadFailed"));
      }

      // Insert demo track record
      const { error: dbError } = await supabase
        .from('demo_tracks')
        .insert({
          artist_id: profile.id,
          title,
          genre,
          description,
          audio_url: audioUrl,
          status: 'pending'
        });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: t("upload.submittedTitle"),
        description: t("upload.submittedDesc"),
      });

      // Reset form
      setAudioFile(null);
      setTitle("");
      setGenre("");
      setDescription("");
      setIsUploaded(false);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: t("upload.uploadFailedTitle"),
        description: (error as any).message || t("upload.uploadFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">{t("upload.title")}</h1>
        <p className="text-muted-foreground">{t("upload.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              {t("upload.cardTitle")}
            </CardTitle>
            <CardDescription>
              {t("upload.cardDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch 
                id="demo-mode" 
                checked={isDemo}
                onCheckedChange={setIsDemo}
              />
              <Label htmlFor="demo-mode">{t("upload.demoToggle")}</Label>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isUploaded ? (
                <div className="flex flex-col items-center gap-4">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                  <div>
                    <h3 className="font-semibold">{t("upload.fileReady")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {audioFile?.name} - {t("upload.readyToSend")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <UploadIcon className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">{t("upload.dropHere")}</h3>
                    <p className="text-sm text-muted-foreground">{t("upload.orClick")}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t("upload.supportedFormats")}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="audio-upload"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="audio-upload" className="cursor-pointer">
                      {t("upload.chooseFile")}
                    </label>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("upload.detailsTitle")}</CardTitle>
            <CardDescription>
              {t("upload.detailsDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">{t("upload.songTitle")}</Label>
                  <Input 
                    id="title" 
                    placeholder={t("upload.songTitlePlaceholder") || undefined}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="genre">{t("upload.genre")}</Label>
                  <Select value={genre} onValueChange={setGenre} required>
                    <SelectTrigger>
                      <SelectValue placeholder={t("upload.genrePlaceholder") || undefined} />
                    </SelectTrigger>
                    <SelectContent>
                      {["Pop", "Rock", "Hip-Hop", "Electronic", "Jazz", "Classical", "R&B", "Country"].map((genreItem) => (
                        <SelectItem key={genreItem} value={genreItem.toLowerCase()}>
                          {genreItem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("upload.aboutSong")}</Label>
                <Textarea 
                  id="description" 
                  placeholder={t("upload.aboutSongPlaceholder") || undefined}
                  className="min-h-[100px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">{t("upload.guidelinesTitle")}</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {t("upload.guideline1")}</li>
                  <li>• {t("upload.guideline2")}</li>
                  <li>• {t("upload.guideline3")}</li>
                  <li>• {t("upload.guideline4")}</li>
                  <li>• {t("upload.guideline5")}</li>
                </ul>
              </div>

              <Button 
                type="submit"
                className="w-full"
                disabled={!isUploaded || uploading || !title || !genre}
              >
                {uploading ? t("upload.uploading") : t("upload.submitDemo")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Upload;
