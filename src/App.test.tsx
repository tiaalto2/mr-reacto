import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the Audio constructor and its methods
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn().mockReturnValue(Promise.resolve()),
  pause: jest.fn(),
  currentTime: 0
}));

// Use fake timers for testing setTimeout
jest.useFakeTimers();

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    (global.Audio as jest.Mock).mockClear();
  });

  test('renders session configuration by default', () => {
    render(<App />);
    
    // Session configuration form should be visible
    expect(screen.getByLabelText(/session duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/minimum interval/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maximum interval/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start session/i })).toBeInTheDocument();
    
    // Training session should not be visible
    expect(screen.queryByText(/time remaining/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /stop session/i })).not.toBeInTheDocument();
  });

  test('switches to training session when configuration form is submitted', () => {
    render(<App />);
    
    // Fill out configuration form
    fireEvent.change(screen.getByLabelText(/session duration/i), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText(/minimum interval/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/maximum interval/i), { target: { value: '5' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /start session/i }));
    
    // Training session should now be visible
    expect(screen.getByText(/time remaining/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stop session/i })).toBeInTheDocument();
    
    // Session configuration should not be visible
    expect(screen.queryByLabelText(/session duration/i)).not.toBeInTheDocument();
  });

  test('switches back to session configuration when session is stopped', () => {
    render(<App />);
    
    // Start session
    fireEvent.change(screen.getByLabelText(/session duration/i), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText(/minimum interval/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/maximum interval/i), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: /start session/i }));
    
    // Stop session
    fireEvent.click(screen.getByRole('button', { name: /stop session/i }));
    
    // Session configuration should be visible again
    expect(screen.getByLabelText(/session duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/minimum interval/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maximum interval/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start session/i })).toBeInTheDocument();
  });
});
