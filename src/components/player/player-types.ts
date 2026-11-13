export type PlayerTrack = {
  id: string;
  title: string;
  channelName: string;
  channelHandle: string;
  coverUrl: string | null;
  src: string;
  durationSec: number | null;
};

export type PlayerSnapshot = {
  track: PlayerTrack | null;
  time: number;
  rate: number;
};

export type PlayerState = {
  track: PlayerTrack | null;
  playing: boolean;
  time: number;
  duration: number;
  rate: number;
  queue: PlayerTrack[];
  sleepRemainingMs: number | null;
  sleepTimerActive: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  play: (track: PlayerTrack) => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  skip: (delta: number) => void;
  changeRate: (rate: number) => void;
  close: () => void;
  enqueue: (track: PlayerTrack) => void;
  dequeue: (id: string) => void;
  moveQueue: (id: string, direction: -1 | 1) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
  startSleepTimer: (minutes: number) => void;
  cancelSleepTimer: () => void;
};
