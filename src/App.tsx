import React, { useState } from 'react';
import SessionConfig, { SessionConfigValues } from './components/SessionConfig/SessionConfig';
import TrainingSession from './components/TrainingSession/TrainingSession';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import './App.css';

const AppContent: React.FC = () => {
  const [sessionConfig, setSessionConfig] = useState<SessionConfigValues | null>(null);
  const [isTrainingActive, setIsTrainingActive] = useState<boolean>(false);
  const { t } = useLanguage();
  
  const handleStartSession = (config: SessionConfigValues) => {
    setSessionConfig(config);
    setIsTrainingActive(true);
  };
  
  const handleStopSession = () => {
    setIsTrainingActive(false);
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>{t.appName}</h1>
        <p className="tagline">{t.appTagline}</p>
      </header>
      
      <main>
        {isTrainingActive && sessionConfig ? (
          <TrainingSession 
            config={sessionConfig}
            onStopSession={handleStopSession}
          />
        ) : (
          <SessionConfig onStartSession={handleStartSession} />
        )}
      </main>
    </div>
  );
};

// Wrap the app with the language provider
const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
