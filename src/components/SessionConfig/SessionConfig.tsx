import React, { useState, FormEvent, useEffect } from 'react';
import './SessionConfig.css';

export interface SessionConfigProps {
  onStartSession: (config: SessionConfigValues) => void;
}

export interface SessionConfigValues {
  duration: number;
  minInterval: number;
  maxInterval: number;
}

// Storage key for localStorage
const STORAGE_KEY = 'mr-reacto-config';

// Default values
const DEFAULT_CONFIG: SessionConfigValues = {
  duration: 60,
  minInterval: 2,
  maxInterval: 5
};

const SessionConfig: React.FC<SessionConfigProps> = ({ onStartSession }) => {
  const [duration, setDuration] = useState<number>(DEFAULT_CONFIG.duration);
  const [minInterval, setMinInterval] = useState<number>(DEFAULT_CONFIG.minInterval);
  const [maxInterval, setMaxInterval] = useState<number>(DEFAULT_CONFIG.maxInterval);
  
  const [durationError, setDurationError] = useState<string>('');
  const [minIntervalError, setMinIntervalError] = useState<string>('');
  const [maxIntervalError, setMaxIntervalError] = useState<string>('');
  
  // Load saved config from localStorage on component mount
  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig) as SessionConfigValues;
        setDuration(parsedConfig.duration);
        setMinInterval(parsedConfig.minInterval);
        setMaxInterval(parsedConfig.maxInterval);
      } catch (error) {
        console.error('Error loading saved configuration', error);
        // If there's an error parsing, we'll use the default values
      }
    }
  }, []);
  
  // Save config to localStorage when values change
  useEffect(() => {
    // Only save valid configurations
    if (
      validateDuration(duration, false) && 
      validateMinInterval(minInterval, false) && 
      validateMaxInterval(minInterval, maxInterval, false)
    ) {
      const configToSave: SessionConfigValues = {
        duration,
        minInterval,
        maxInterval
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));
    }
  }, [duration, minInterval, maxInterval]);
  
  const validateDuration = (value: number, updateState = true): boolean => {
    if (value < 30) {
      if (updateState) setDurationError('Duration must be at least 30 seconds');
      return false;
    }
    
    if (value > 3600) {
      if (updateState) setDurationError('Duration cannot exceed 60 minutes');
      return false;
    }
    
    if (updateState) setDurationError('');
    return true;
  };
  
  const validateMinInterval = (value: number, updateState = true): boolean => {
    if (value <= 0) {
      if (updateState) setMinIntervalError('Minimum interval must be positive');
      return false;
    }
    
    if (updateState) setMinIntervalError('');
    return true;
  };
  
  const validateMaxInterval = (min: number, max: number, updateState = true): boolean => {
    if (max <= min) {
      if (updateState) setMaxIntervalError('Maximum interval must be greater than minimum interval');
      return false;
    }
    
    if (updateState) setMaxIntervalError('');
    return true;
  };
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const isValidDuration = validateDuration(duration);
    const isValidMinInterval = validateMinInterval(minInterval);
    const isValidMaxInterval = validateMaxInterval(minInterval, maxInterval);
    
    if (isValidDuration && isValidMinInterval && isValidMaxInterval) {
      const config: SessionConfigValues = {
        duration,
        minInterval,
        maxInterval
      };
      
      // Save config one last time before starting session
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      
      onStartSession(config);
    }
  };
  
  return (
    <div className="session-config">
      <div className="logo">Mr. Reacto</div>
      <h2>Training Configuration</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="duration">
            Session Duration (seconds):
            <input
              id="duration"
              type="number"
              min="30"
              max="3600"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              onBlur={() => validateDuration(duration)}
            />
          </label>
          {durationError && <div className="error">{durationError}</div>}
          <div className="help-text">From 30 seconds to 60 minutes (3600 seconds)</div>
        </div>
        
        <div className="form-group">
          <label htmlFor="minInterval">
            Minimum Interval (seconds):
            <input
              id="minInterval"
              type="number"
              min="1"
              value={minInterval}
              onChange={(e) => setMinInterval(Number(e.target.value))}
              onBlur={() => validateMinInterval(minInterval)}
            />
          </label>
          {minIntervalError && <div className="error">{minIntervalError}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="maxInterval">
            Maximum Interval (seconds):
            <input
              id="maxInterval"
              type="number"
              min="1"
              value={maxInterval}
              onChange={(e) => setMaxInterval(Number(e.target.value))}
              onBlur={() => validateMaxInterval(minInterval, maxInterval)}
            />
          </label>
          {maxIntervalError && <div className="error">{maxIntervalError}</div>}
        </div>
        
        <button type="submit" className="start-button">Start Training</button>
      </form>
    </div>
  );
};

export default SessionConfig; 
