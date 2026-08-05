import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Fullscreen, Camera } from "lucide-react";
import Hls from "hls.js";

function useFullscreen(ref: React.RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const handler = () => setActive(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);
  const toggle = async () => {
    if (!ref.current) return;
    try {
      if (!document.fullscreenElement) await ref.current.requestFullscreen();
      else await document.exitFullscreen();
    } catch (e) { console.warn(e); }
  };
  return { active, toggle };
}

function classNames(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function HlsPlayer({ src, className }: { src: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);
  const { toggle } = useFullscreen(wrapperRef);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let hls: Hls | null = null;
    setError(false);

    const play = () => setIsPlaying(!video.paused);
    video.addEventListener("play", play);
    video.addEventListener("pause", play);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.play().catch(() => {});
    } else if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: false, maxBufferLength: 30 });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setError(true);
          hls?.destroy();
        }
      });
      video.play().catch(() => {});
    } else {
      setError(true);
    }

    return () => {
      hls?.destroy();
      video.removeEventListener("play", play);
      video.removeEventListener("pause", play);
    };
  }, [src]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.paused ? video.play().catch(() => {}) : video.pause();
  };

  return (
    <div ref={wrapperRef} className={classNames("relative bg-black rounded-xl overflow-hidden group", className)}>
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground text-sm z-10 bg-black/80 gap-2">
          <Camera className="h-8 w-8 opacity-40" />
          Не удалось открыть поток
        </div>
      )}
      <video ref={videoRef} className="w-full h-full object-contain" playsInline muted={false} />
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={togglePlay}>
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full ml-auto" onClick={toggle}>
          <Fullscreen className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
