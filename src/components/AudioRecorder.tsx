import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Mic, Square, Play, Save, X } from "lucide-react";
import { api } from "../utils/api";

interface AudioRecorderProps {
  onSave: (audioUrl: string) => void;
  onCancel: () => void;
  accessToken: string;
}

export function AudioRecorder({
  onSave,
  onCancel,
  accessToken,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err: any) {
      setError(
        "Microphone access denied. Please allow microphone access in your browser settings."
      );
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (audioUrl) {
      new Audio(audioUrl).play();
    }
  };

  const saveRecording = async () => {
    if (!audioUrl) return;

    setIsUploading(true);
    setError(null);

    try {
      // Convert blob URL to actual blob
      const response = await fetch(audioUrl);
      const blob = await response.blob();

      // Create a File object from the blob
      const fileName = `audio-${Date.now()}.webm`;
      const file = new File([blob], fileName, { type: "audio/webm" });

      // Upload using API wrapper (pass blob and filename separately)
      const result = await api.uploadAudio(accessToken, blob, fileName);

      if (result.success && result.url) {
        onSave(result.url);
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error("Error uploading audio:", err);
      setError("Failed to upload audio. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {!isRecording && !audioUrl && (
          <Button
            onClick={startRecording}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Mic className="w-4 h-4 mr-2" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <Button
            onClick={stopRecording}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white animate-pulse"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop Recording
          </Button>
        )}

        {audioUrl && !isRecording && (
          <>
            <Button
              onClick={playRecording}
              size="sm"
              variant="outline"
              className="border-zinc-200"
            >
              <Play className="w-4 h-4 mr-2" />
              Play
            </Button>
            <Button
              onClick={saveRecording}
              size="sm"
              disabled={isUploading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Save Audio"}
            </Button>
            <Button
              onClick={() => setAudioUrl(null)}
              size="sm"
              variant="outline"
              className="border-zinc-200"
            >
              Record Again
            </Button>
          </>
        )}

        <Button
          onClick={onCancel}
          size="sm"
          variant="ghost"
          className="text-zinc-600"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
          Recording in progress...
        </div>
      )}

      {audioUrl && (
        <div className="text-sm text-green-600">
          ✓ Recording complete! Play to review or save to finish.
        </div>
      )}
    </div>
  );
}
