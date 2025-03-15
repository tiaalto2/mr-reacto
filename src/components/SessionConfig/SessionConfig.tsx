import React, { useState, FormEvent, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
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
  const { t } = useLanguage();
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
      if (updateState) setDurationError(t.durationMin);
      return false;
    }
    
    if (value > 3600) {
      if (updateState) setDurationError(t.durationMax);
      return false;
    }
    
    if (updateState) setDurationError('');
    return true;
  };
  
  const validateMinInterval = (value: number, updateState = true): boolean => {
    if (value <= 0) {
      if (updateState) setMinIntervalError(t.minIntervalPositive);
      return false;
    }
    
    if (updateState) setMinIntervalError('');
    return true;
  };
  
  const validateMaxInterval = (min: number, max: number, updateState = true): boolean => {
    if (max <= min) {
      if (updateState) setMaxIntervalError(t.maxIntervalGreater);
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
      <LanguageSelector />
      <div className="logo">{t.appName}</div>
      <h2>{t.trainingConfiguration}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="duration">
            {t.sessionDuration}
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
          <div className="help-text">{t.durationHelp}</div>
        </div>
        
        <div className="form-group">
          <label htmlFor="minInterval">
            {t.minimumInterval}
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
            {t.maximumInterval}
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
        
        <button type="submit" className="start-button">{t.startTraining}</button>
      </form>
    </div>
  );
};

export default SessionConfig; 
