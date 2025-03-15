import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrainingSession from '../TrainingSession/TrainingSession';

// Mock Audio implementation
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn().mockReturnValue(Promise.resolve()),
  pause: jest.fn(),
  currentTime: 0
}));

// Mock timing functions
jest.useFakeTimers();

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
  });

  test('renders session timer and stop button', () => {
    render(<TrainingSession config={mockConfig} onStopSession={jest.fn()} />);
    
    expect(screen.getByText(/time remaining/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stop training/i })).toBeInTheDocument();
  });
  
  test('countdown timer decreases over time', () => {
    render(<TrainingSession config={mockConfig} onStopSession={jest.fn()} />);
    
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
    render(<TrainingSession config={mockConfig} onStopSession={onStopSessionMock} />);
    
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
    
    render(<TrainingSession config={mockConfig} onStopSession={jest.fn()} />);
    
    // We know the first signal will be scheduled
    expect(global.Audio).toHaveBeenCalled();
  });
  
  test('flash element exists in the component', () => {
    render(<TrainingSession config={mockConfig} onStopSession={jest.fn()} />);
    
    // Verify that the flash element exists
    const flashElement = screen.getByTestId('visual-flash');
    expect(flashElement).toBeInTheDocument();
    expect(flashElement.classList.contains('flash-overlay')).toBe(true);
  });
  
  test('stopping session calls onStopSession', () => {
    const onStopSessionMock = jest.fn();
    render(<TrainingSession config={mockConfig} onStopSession={onStopSessionMock} />);
    
    // Click stop button
    screen.getByRole('button', { name: /stop training/i }).click();
    
    // onStopSession should be called
    expect(onStopSessionMock).toHaveBeenCalled();
  });
}); 
