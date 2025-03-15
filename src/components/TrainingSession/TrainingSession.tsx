import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SessionConfigValues } from '../SessionConfig/SessionConfig';
import './TrainingSession.css';

interface TrainingSessionProps {
  config: SessionConfigValues;
  onStopSession: () => void;
}

// Helper for safely playing audio (works in both real and test environments)
const playAudio = (audio: HTMLAudioElement) => {
  if (typeof audio.play === 'function') {
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
    });
  }
};

// Helper for safely pausing audio (works in both real and test environments)
const pauseAudio = (audio: HTMLAudioElement) => {
  if (typeof audio.pause === 'function') {
    audio.pause();
  }
};

const TrainingSession: React.FC<TrainingSessionProps> = ({ config, onStopSession }) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(config.duration);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  
  // References to store the timers
  const sessionTimerRef = useRef<number | null>(null);
  const signalTimerRef = useRef<number | null>(null);
  const flashTimerRef = useRef<number | null>(null);
  
  // Audio instance
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Function to generate a random interval within the configured range
  const getRandomInterval = useCallback((): number => {
    const { minInterval, maxInterval } = config;
    return Math.floor(Math.random() * (maxInterval - minInterval + 1) + minInterval) * 1000;
  }, [config]);
  
  // Function to trigger a signal
  const triggerSignal = useCallback(() => {
    // Play audio
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/gunshot.mp3');
    }
    if (audioRef.current) {
      if (typeof audioRef.current.currentTime === 'number') {
        audioRef.current.currentTime = 0;
      }
      playAudio(audioRef.current);
    }
    
    // Show visual flash
    setIsFlashing(true);
    
    // Clear any existing flash timer
    if (flashTimerRef.current) {
      window.clearTimeout(flashTimerRef.current);
    }
    
    // Hide flash after 500ms
    flashTimerRef.current = window.setTimeout(() => {
      setIsFlashing(false);
    }, 500);
    
    // Schedule next signal with a random interval
    const nextInterval = getRandomInterval();
    signalTimerRef.current = window.setTimeout(() => triggerSignal(), nextInterval);
  }, [getRandomInterval]);
  
  // Initialize session when component mounts
  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('/sounds/gunshot.mp3');
    
    // Start countdown timer
    sessionTimerRef.current = window.setInterval(() => {
      setTimeRemaining(prevTime => {
        // End session when time is up
        if (prevTime <= 1) {
          onStopSession();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    // Schedule first signal
    const initialInterval = getRandomInterval();
    signalTimerRef.current = window.setTimeout(() => triggerSignal(), initialInterval);
    
    // Clean up when component unmounts
    return () => {
      if (sessionTimerRef.current) window.clearInterval(sessionTimerRef.current);
      if (signalTimerRef.current) window.clearTimeout(signalTimerRef.current);
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
      if (audioRef.current) pauseAudio(audioRef.current);
    };
  }, [onStopSession, getRandomInterval, triggerSignal]);
  
  return (
    <div className="training-session">
      <div className={`flash-overlay ${isFlashing ? 'flashing' : ''}`} data-testid="visual-flash"></div>
      
      <div className="session-info">
        <h2>Training in Progress</h2>
        <div className="timer">
          <span>Time Remaining:</span>
          <span className="time-display">{formatTime(timeRemaining)}</span>
        </div>
      </div>
      
      <button 
        className="stop-button"
        onClick={onStopSession}
      >
        Stop Session
      </button>
    </div>
  );
};

export default TrainingSession; 
