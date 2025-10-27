import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import { Play, Pause, MessageSquare, Clock, ThumbsUp, Send } from "lucide-react";

const Review = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("1:23");
  const [newComment, setNewComment] = useState("");

  const comments = [
    {
      id: 1,
      producer: "Sarah Martinez",
      timestamp: "0:45",
      comment: "Love the bassline here! Maybe we could add some subtle reverb to create more space?",
      time: "2 hours ago",
      likes: 3
    },
    {
      id: 2,
      producer: "Mike Rodriguez",
      timestamp: "1:12",
      comment: "The vocal sits perfectly in the mix. What if we layer some harmonies in the chorus?",
      time: "1 hour ago",
      likes: 5
    },
    {
      id: 3,
      producer: "David Chen",
      timestamp: "2:30",
      comment: "This breakdown is fire! Could use a slight EQ boost around 8kHz for extra sparkle.",
      time: "30 minutes ago",
      likes: 2
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Track Review</h1>
        <p className="text-muted-foreground">Collaborate with producers on "Midnight Dreams"</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Audio Player & Waveform */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Midnight Dreams</CardTitle>
                  <p className="text-muted-foreground">by Alex Chen • Electronic</p>
                </div>
                <Badge variant="secondary">Under Review</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Waveform Display */}
              <div className="relative">
                <WaveformVisualizer 
                  className="w-full h-20" 
                  animated={isPlaying}
                  data={Array.from({ length: 60 }, () => Math.random())}
                />
                <div className="absolute top-0 left-1/3 w-0.5 h-full bg-accent animate-pulse" />
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-neon hover:shadow-neon transition-all duration-300 rounded-full w-12 h-12"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    {currentTime} / 3:42
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button variant="outline" size="sm">
                    Request Changes
                  </Button>
                </div>
              </div>

              {/* Timeline Comments */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Timeline Comments</Label>
                {comments.map((comment) => (
                  <div key={comment.id} className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {comment.timestamp}
                        </Badge>
                        <span className="text-sm font-medium">{comment.producer}</span>
                        <span className="text-xs text-muted-foreground">{comment.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{comment.likes}</span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{comment.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add Comment */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Add Timestamped Comment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timestamp">Timestamp</Label>
                  <Input 
                    id="timestamp" 
                    placeholder="1:23"
                    className="bg-input border-border"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="comment">Comment</Label>
                  <Textarea
                    id="comment"
                    placeholder="Leave your feedback at this timestamp..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="bg-input border-border resize-none"
                    rows={1}
                  />
                </div>
              </div>
              <Button className="w-full bg-gradient-neon hover:shadow-neon transition-all duration-300">
                <Send className="w-4 h-4 mr-2" />
                Add Comment
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Track Info */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Track Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Duration</Label>
                <p className="text-sm">3:42</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">BPM</Label>
                <p className="text-sm">128</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Key</Label>
                <p className="text-sm">C Minor</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Format</Label>
                <p className="text-sm">WAV, 44.1kHz 24-bit</p>
              </div>
            </CardContent>
          </Card>

          {/* Producer Tools */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Producer Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                Voice Note
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Export Stems
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Suggested Edits
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Reference Tracks
              </Button>
            </CardContent>
          </Card>

          {/* Collaboration Status */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground">60%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-gradient-neon h-2 rounded-full w-3/5"></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  3 of 5 producers have reviewed
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Review;