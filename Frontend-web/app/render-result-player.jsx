import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { downloadRenderResult } from "./api";


export default function RenderResultPlayer({ jobId }) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const audioRef = useRef();
  const prevUrl = useRef();

  async function handleDownloadAndPlay() {
    try {
      const { blob, filename, mime } = await downloadRenderResult(jobId);

      const url = URL.createObjectURL(mime.startsWith("audio/") ? new Blob([blob], { type: mime }) : blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();

      if (mime.startsWith("audio/")) {
        setAudioUrl(url);
      }

    } catch (e) {
      setError("e.message : 결과 다운로드에 실패했습니다.");
    }
  }

  useEffect(() => {
    if (!audioUrl|| !audioRef.current) return;
    const audio = audioRef.current;

    audio.pause();
    audio.currentTime = 0;

    const tryPlay = () => {
      const p = audio.play();
      if (p != undefined) {
        p.catch((err) => {
          setError("오디오 재생에 실패했습니다. 브라우저 설정을 확인해주세요.");
        });
      }     
    };

    if (audio.readyState >= 3) {
      tryPlay();
    } else {
      audio.addEventListener("canplaythrough", tryPlay, { once: true });
    }

    return () => {
      audio.removeEventListener("canplaythrough", tryPlay);
      audio.pause();
    };
  },[audioUrl]);


  return (
    <div className="space-y-4 mt-4">
      <Button className="w-full h-12" onClick={handleDownloadAndPlay} disabled={!jobId}>
        결과 듣기 & 다운로드
      </Button>
        <audio
          ref={audioRef}
          controls
          src={audioUrl}
          disabled={!audioUrl}
          className="w-full rounded-md border"
        />
    </div>
  );
}
