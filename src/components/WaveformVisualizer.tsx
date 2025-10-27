import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface WaveformVisualizerProps {
  className?: string;
  animated?: boolean;
  data?: number[];
}

const WaveformVisualizer = ({ 
  className, 
  animated = false, 
  data = Array.from({ length: 40 }, () => Math.random()) 
}: WaveformVisualizerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animated || !containerRef.current) return;

    const bars = containerRef.current.querySelectorAll('.waveform-bar');
    
    const animateBars = () => {
      bars.forEach((bar, index) => {
        const randomHeight = Math.random() * 100 + 20;
        (bar as HTMLElement).style.height = `${randomHeight}%`;
        (bar as HTMLElement).style.animationDelay = `${index * 0.1}s`;
      });
    };

    const interval = setInterval(animateBars, 1000);
    return () => clearInterval(interval);
  }, [animated]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex items-end justify-center gap-1 h-20",
        className
      )}
    >
      {data.map((height, index) => (
        <div
          key={index}
          className={cn(
            "waveform-bar bg-gradient-waveform rounded-full transition-all duration-300",
            "w-1 min-h-[8px]",
            animated && "animate-wave"
          )}
          style={{
            height: `${height * 80 + 20}%`,
            animationDelay: `${index * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};

export default WaveformVisualizer;