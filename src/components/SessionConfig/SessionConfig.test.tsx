import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SessionConfig from '../SessionConfig/SessionConfig';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('SessionConfig Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('renders session configuration form with default values when no saved data', () => {
    render(<SessionConfig onStartSession={jest.fn()} />);
    
    // Check if all form elements are present with default values
    const durationInput = screen.getByLabelText(/session duration/i) as HTMLInputElement;
    const minIntervalInput = screen.getByLabelText(/minimum interval/i) as HTMLInputElement;
    const maxIntervalInput = screen.getByLabelText(/maximum interval/i) as HTMLInputElement;
    
    expect(durationInput.value).toBe('60');
    expect(minIntervalInput.value).toBe('2');
    expect(maxIntervalInput.value).toBe('5');
    expect(screen.getByRole('button', { name: /start training/i })).toBeInTheDocument();
  });

  test('loads saved configuration values from localStorage', () => {
    // Setup localStorage with saved values
    const savedConfig = {
      duration: 120,
      minInterval: 3,
      maxInterval: 8
    };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedConfig));
    
    render(<SessionConfig onStartSession={jest.fn()} />);
    
    // Check if values are loaded from localStorage
    const durationInput = screen.getByLabelText(/session duration/i) as HTMLInputElement;
    const minIntervalInput = screen.getByLabelText(/minimum interval/i) as HTMLInputElement;
    const maxIntervalInput = screen.getByLabelText(/maximum interval/i) as HTMLInputElement;
    
    expect(durationInput.value).toBe('120');
    expect(minIntervalInput.value).toBe('3');
    expect(maxIntervalInput.value).toBe('8');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('mr-reacto-config');
  });

  test('validates session duration between 30 seconds and 60 minutes', () => {
    render(<SessionConfig onStartSession={jest.fn()} />);
    
    const durationInput = screen.getByLabelText(/session duration/i);
    
    // Test below minimum
    fireEvent.change(durationInput, { target: { value: '29' } });
    fireEvent.blur(durationInput);
    expect(screen.getByText(/duration must be at least 30 seconds/i)).toBeInTheDocument();
    
    // Test above maximum
    fireEvent.change(durationInput, { target: { value: '3601' } });
    fireEvent.blur(durationInput);
    expect(screen.getByText(/duration cannot exceed 60 minutes/i)).toBeInTheDocument();
    
    // Test valid values
    fireEvent.change(durationInput, { target: { value: '300' } });
    fireEvent.blur(durationInput);
    expect(screen.queryByText(/duration must be at least/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/duration cannot exceed/i)).not.toBeInTheDocument();
  });

  test('validates minimum interval is positive', () => {
    render(<SessionConfig onStartSession={jest.fn()} />);
    
    const minIntervalInput = screen.getByLabelText(/minimum interval/i);
    
    // Test negative value
    fireEvent.change(minIntervalInput, { target: { value: '-1' } });
    fireEvent.blur(minIntervalInput);
    expect(screen.getByText(/minimum interval must be positive/i)).toBeInTheDocument();
    
    // Test valid value
    fireEvent.change(minIntervalInput, { target: { value: '1' } });
    fireEvent.blur(minIntervalInput);
    expect(screen.queryByText(/minimum interval must be positive/i)).not.toBeInTheDocument();
  });

  test('validates maximum interval is greater than minimum interval', () => {
    render(<SessionConfig onStartSession={jest.fn()} />);
    
    const minIntervalInput = screen.getByLabelText(/minimum interval/i);
    const maxIntervalInput = screen.getByLabelText(/maximum interval/i);
    
    // Set minimum interval
    fireEvent.change(minIntervalInput, { target: { value: '5' } });
    
    // Test max interval less than min interval
    fireEvent.change(maxIntervalInput, { target: { value: '4' } });
    fireEvent.blur(maxIntervalInput);
    expect(screen.getByText(/maximum interval must be greater than minimum interval/i)).toBeInTheDocument();
    
    // Test valid max interval
    fireEvent.change(maxIntervalInput, { target: { value: '10' } });
    fireEvent.blur(maxIntervalInput);
    expect(screen.queryByText(/maximum interval must be greater than minimum interval/i)).not.toBeInTheDocument();
  });

  test('calls onStartSession with correct values when form is submitted', () => {
    const onStartSessionMock = jest.fn();
    render(<SessionConfig onStartSession={onStartSessionMock} />);
    
    // Fill out form
    fireEvent.change(screen.getByLabelText(/session duration/i), { target: { value: '300' } });
    fireEvent.change(screen.getByLabelText(/minimum interval/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/maximum interval/i), { target: { value: '5' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /start training/i }));
    
    // Check if onStartSession was called with correct values
    expect(onStartSessionMock).toHaveBeenCalledWith({
      duration: 300,
      minInterval: 2,
      maxInterval: 5
    });
    
    // Check if localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'mr-reacto-config',
      JSON.stringify({
        duration: 300,
        minInterval: 2,
        maxInterval: 5
      })
    );
  });

  test('saves valid values to localStorage when values change', () => {
    render(<SessionConfig onStartSession={jest.fn()} />);
    
    // Update values to valid configuration
    fireEvent.change(screen.getByLabelText(/session duration/i), { target: { value: '180' } });
    fireEvent.change(screen.getByLabelText(/minimum interval/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/maximum interval/i), { target: { value: '7' } });
    
    // Check if localStorage was updated with the new values
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'mr-reacto-config',
      JSON.stringify({
        duration: 180,
        minInterval: 3,
        maxInterval: 7
      })
    );
  });

  test('does not save invalid configurations to localStorage', () => {
    render(<SessionConfig onStartSession={jest.fn()} />);
    
    // Clear previous calls to setItem (from initial component render)
    jest.clearAllMocks();
    
    // Set an invalid configuration (min > max)
    fireEvent.change(screen.getByLabelText(/minimum interval/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/maximum interval/i), { target: { value: '5' } });
    
    // localStorage.setItem should not have been called with the invalid config
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });
}); 
