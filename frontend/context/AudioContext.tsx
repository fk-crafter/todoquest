"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

type AudioContextType = {
  isPlaying: boolean;
  volume: number;
  toggleMusic: () => void;
  stopMusic: () => void;
  setMusicSource: (src: string) => void;
  setVolume: (vol: number) => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [source, setSource] = useState("/title-sound.wav");

  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(source);
    audio.loop = true;
    audio.volume = volume;
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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch((err) => console.log("Play error", err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const toggleMusic = () => {
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
    if (source === src) return;
    setSource(src);
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        toggleMusic,
        stopMusic,
        setMusicSource,
        volume,
        setVolume,
      }}
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
