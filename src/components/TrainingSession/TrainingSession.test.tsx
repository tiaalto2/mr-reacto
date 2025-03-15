import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrainingSession from '../TrainingSession/TrainingSession';
import { LanguageProvider } from '../../i18n/LanguageContext';

// Mock Audio implementation
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn().mockReturnValue(Promise.resolve()),
  pause: jest.fn(),
  currentTime: 0
}));

// Mock timing functions
jest.useFakeTimers();

// Helper to wrap component with language provider
const renderWithLanguage = (ui: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {ui}
    </LanguageProvider>
  );
};

describe('TrainingSession Component', () => {
  const mockConfig = {
    duration: 60, // 60 seconds
    minInterval: 2,
    maxInterval: 5
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    
    // Clear any Audio mocks
    (global.Audio as jest.Mock).mockClear();
    
    // Clear localStorage
    localStorage.clear();
  });

  test('renders session timer and stop button', () => {
    renderWithLanguage(<TrainingSession config={mockConfig} onStopSession={jest.fn()} />);
    
    // In both languages the remaining time is displayed
    expect(screen.getByText(/time remaining|aikaa jäljellä/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stop training|lopeta harjoitus/i })).toBeInTheDocument();
  });
  
  test('countdown timer decreases over time', () => {
    renderWithLanguage(<TrainingSession config={mockConfig} onStopSession={jest.fn()} />);
    
    // Initial time should be displayed (01:00 for 60 seconds)
    expect(screen.getByText(/01:00/)).toBeInTheDocument();
    
    // Advance timer by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Time should be decreased
    expect(screen.getByText(/00:59/)).toBeInTheDocument();
  });
  
  test('session ends when timer reaches zero', () => {
    const onStopSessionMock = jest.fn();
    renderWithLanguage(<TrainingSession config={mockConfig} onStopSession={onStopSessionMock} />);
    
    // Advance timer to the end of the session
    act(() => {
      jest.advanceTimersByTime(mockConfig.duration * 1000);
    });
    
    // onStopSession should be called
    expect(onStopSessionMock).toHaveBeenCalled();
  });
  
  test('audio plays during session', () => {
    const mockPlay = jest.fn().mockReturnValue(Promise.resolve());
    const mockAudio = { play: mockPlay, pause: jest.fn(), currentTime: 0 };
    (global.Audio as jest.Mock).mockImplementation(() => mockAudio);
    
    renderWithLanguage(<TrainingSession config={mockConfig} onStopSession={jest.fn()} />);
    
    // We know the first signal will be scheduled
    expect(global.Audio).toHaveBeenCalled();
  });
  
  test('flash element exists in the component', () => {
    renderWithLanguage(<TrainingSession config={mockConfig} onStopSession={jest.fn()} />);
    
    // Verify that the flash element exists
    const flashElement = screen.getByTestId('visual-flash');
    expect(flashElement).toBeInTheDocument();
    expect(flashElement.classList.contains('flash-overlay')).toBe(true);
  });
  
  test('stopping session calls onStopSession', () => {
    const onStopSessionMock = jest.fn();
    renderWithLanguage(<TrainingSession config={mockConfig} onStopSession={onStopSessionMock} />);
    
    // Click stop button (works with either language)
    screen.getByRole('button', { name: /stop|lopeta/i }).click();
    
    // onStopSession should be called
    expect(onStopSessionMock).toHaveBeenCalled();
  });
}); 
