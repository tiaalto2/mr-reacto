import React, { useState, FormEvent } from 'react';
import './SessionConfig.css';

export interface SessionConfigProps {
  onStartSession: (config: SessionConfigValues) => void;
}

export interface SessionConfigValues {
  duration: number;
  minInterval: number;
  maxInterval: number;
}

const SessionConfig: React.FC<SessionConfigProps> = ({ onStartSession }) => {
  const [duration, setDuration] = useState<number>(60);
  const [minInterval, setMinInterval] = useState<number>(2);
  const [maxInterval, setMaxInterval] = useState<number>(5);
  
  const [durationError, setDurationError] = useState<string>('');
  const [minIntervalError, setMinIntervalError] = useState<string>('');
  const [maxIntervalError, setMaxIntervalError] = useState<string>('');
  
  const validateDuration = (value: number): boolean => {
    if (value < 30) {
      setDurationError('Duration must be at least 30 seconds');
      return false;
    }
    
    if (value > 3600) {
      setDurationError('Duration cannot exceed 60 minutes');
      return false;
    }
    
    setDurationError('');
    return true;
  };
  
  const validateMinInterval = (value: number): boolean => {
    if (value <= 0) {
      setMinIntervalError('Minimum interval must be positive');
      return false;
    }
    
    setMinIntervalError('');
    return true;
  };
  
  const validateMaxInterval = (min: number, max: number): boolean => {
    if (max <= min) {
      setMaxIntervalError('Maximum interval must be greater than minimum interval');
      return false;
    }
    
    setMaxIntervalError('');
    return true;
  };
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const isValidDuration = validateDuration(duration);
    const isValidMinInterval = validateMinInterval(minInterval);
    const isValidMaxInterval = validateMaxInterval(minInterval, maxInterval);
    
    if (isValidDuration && isValidMinInterval && isValidMaxInterval) {
      onStartSession({
        duration,
        minInterval,
        maxInterval
      });
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
