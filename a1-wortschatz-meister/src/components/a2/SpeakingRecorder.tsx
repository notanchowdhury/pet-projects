import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square } from 'lucide-react';

const MIN_SECONDS = 60;

/** Records the learner in the browser. The task can only be ticked after a recording of at least MIN_SECONDS. */
export default function SpeakingRecorder({ onLongEnough }: { onLongEnough: () => void }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const timer = useRef<number>();

  useEffect(() => () => {
    window.clearInterval(timer.current);
    rec.current?.stream.getTracks().forEach((t) => t.stop());
  }, []);

  const startRec = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const r = new MediaRecorder(stream);
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setUrl(URL.createObjectURL(new Blob(chunks, { type: r.mimeType })));
      };
      r.start();
      rec.current = r;
      setSeconds(0);
      setUrl(null);
      setRecording(true);
      const began = Date.now();
      timer.current = window.setInterval(() => setSeconds(Math.floor((Date.now() - began) / 1000)), 250);
    } catch {
      setError('Microphone not available. Record yourself with your phone instead, then tick the box below.');
    }
  };

  const stopRec = () => {
    window.clearInterval(timer.current);
    rec.current?.stop();
    setRecording(false);
    if (seconds >= MIN_SECONDS) onLongEnough();
  };

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center gap-3">
        {recording ? (
          <Button variant="destructive" onClick={stopRec} className="gap-2"><Square className="h-4 w-4" /> Stop</Button>
        ) : (
          <Button onClick={startRec} className="gap-2"><Mic className="h-4 w-4" /> Record</Button>
        )}
        <span className={`font-mono text-lg ${seconds >= MIN_SECONDS ? 'text-green-600' : ''}`}>
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
        </span>
        <span className="text-sm text-muted-foreground">Speak for at least {MIN_SECONDS} seconds without stopping.</span>
      </div>
      {url && <audio controls src={url} className="w-full" />}
      {url && seconds < MIN_SECONDS && <p className="text-sm text-red-600">Too short. Try again and keep talking for a full minute.</p>}
      {error && <p className="text-sm text-orange-600">{error}</p>}
    </div>
  );
}
