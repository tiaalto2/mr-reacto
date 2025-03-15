import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SessionConfig from './SessionConfig';

describe('SessionConfig Component', () => {
  test('renders session configuration form', () => {
    render(<SessionConfig onStartSession={jest.fn()} />);
    
    // Check if all form elements are present
    expect(screen.getByLabelText(/session duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/minimum interval/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maximum interval/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start session/i })).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole('button', { name: /start session/i }));
    
    // Check if onStartSession was called with correct values
    expect(onStartSessionMock).toHaveBeenCalledWith({
      duration: 300,
      minInterval: 2,
      maxInterval: 5
    });
  });
}); 
