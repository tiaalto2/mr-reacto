import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrainingSession from './TrainingSession';

// Mock Audio implementation
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn(),
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
    expect(screen.getByRole('button', { name: /stop session/i })).toBeInTheDocument();
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
  
  test('signals are triggered at random intervals', () => {
    // Mock random function to return predictable values
    const originalMath = global.Math;
    global.Math = Object.create(global.Math);
    global.Math.random = jest.fn().mockReturnValue(0.5);
    
    // Clear the Audio mock
    (global.Audio as jest.Mock).mockClear();
    
    render(<TrainingSession config={mockConfig} onStopSession={jest.fn()} />);
    
    // The Audio constructor should be called once during initialization
    // We need to clear that initial call
    (global.Audio as jest.Mock).mockClear();
    
    // First random interval should be (0.5 * (5-2)) + 2 = 3.5 seconds
    const expectedFirstInterval = 3500;
    
    // Advance just before the signal should trigger
    act(() => {
      jest.advanceTimersByTime(expectedFirstInterval - 100);
    });
    
    // Audio should not have been played yet
    expect(global.Audio).not.toHaveBeenCalled();
    
    // Advance just past when the signal should trigger
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    // Audio should have been created with the correct sound file
    expect(global.Audio).toHaveBeenCalledWith('/sounds/gunshot.mp3');
    
    // Play should have been called on the audio instance
    const mockAudioInstance = (global.Audio as jest.Mock).mock.instances[0];
    expect(mockAudioInstance.play).toHaveBeenCalled();
    
    // Restore original Math
    global.Math = originalMath;
  });
  
  test('visual flash is shown when signal is triggered', () => {
    // Mock random to get predictable interval
    const originalMath = global.Math;
    global.Math = Object.create(global.Math);
    global.Math.random = jest.fn().mockReturnValue(0.5);
    
    render(<TrainingSession config={mockConfig} onStopSession={jest.fn()} />);
    
    // Initial state - flash overlay should not have flashing class
    const flashElement = screen.getByTestId('visual-flash');
    expect(flashElement).not.toHaveClass('flashing');
    
    // Trigger the signal by advancing time
    act(() => {
      jest.advanceTimersByTime(3500); // Same interval as previous test
    });
    
    // Now the flash element should have the flashing class
    expect(flashElement).toHaveClass('flashing');
    
    // After 500ms, the flash should disappear
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Flash element should no longer have the flashing class
    expect(flashElement).not.toHaveClass('flashing');
    
    // Restore original Math
    global.Math = originalMath;
  });
  
  test('stopping session calls onStopSession', () => {
    const onStopSessionMock = jest.fn();
    render(<TrainingSession config={mockConfig} onStopSession={onStopSessionMock} />);
    
    // Click stop button
    screen.getByRole('button', { name: /stop session/i }).click();
    
    // onStopSession should be called
    expect(onStopSessionMock).toHaveBeenCalled();
  });
}); 
