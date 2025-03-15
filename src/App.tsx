import React, { useState } from 'react';
import SessionConfig, { SessionConfigValues } from './components/SessionConfig/SessionConfig';
import TrainingSession from './components/TrainingSession/TrainingSession';
import './App.css';

const App: React.FC = () => {
  const [sessionConfig, setSessionConfig] = useState<SessionConfigValues | null>(null);
  const [isTrainingActive, setIsTrainingActive] = useState<boolean>(false);
  
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
        <h1>Reaction Training</h1>
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

export default App;
