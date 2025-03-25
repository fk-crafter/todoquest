"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

type AudioContextType = {
  isPlaying: boolean;
  toggleMusic: () => void;
  stopMusic: () => void;
  setMusicSource: (src: string) => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [source, setSource] = useState("/title-sound.wav");

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(source);
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    if (isPlaying) {
      audio
        .play()
        .then(() => {})
        .catch((err) => console.log("Autoplay blocked:", err));
    }

    return () => {
      audio.pause();
    };
  }, [source]);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current
        .play()
        .catch((err) => console.log("Autoplay blocked:", err));
    }

    setIsPlaying(!isPlaying);
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const setMusicSource = (src: string) => {
    setSource(src);
  };

  return (
    <AudioContext.Provider
      value={{ isPlaying, toggleMusic, stopMusic, setMusicSource }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
