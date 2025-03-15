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
    
    // Clear localStorage
    localStorage.clear();
  });

  test('renders session configuration by default', () => {
    render(<App />);
    
    // Session configuration form should be visible (using language-independent selectors)
    // Using test IDs or roles instead of text content which depends on language
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/minimum/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maximum/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /training/i })).toBeInTheDocument();
    
    // Language selector should be visible
    expect(screen.getByLabelText(/kieli|language/i)).toBeInTheDocument();
    
    // Training session should not be visible
    expect(screen.queryByTestId('visual-flash')).not.toBeInTheDocument();
  });

  test('switches to training session when configuration form is submitted', () => {
    render(<App />);
    
    // Fill out configuration form
    const durationInput = screen.getByLabelText(/duration/i);
    const minIntervalInput = screen.getByLabelText(/minimum/i);
    const maxIntervalInput = screen.getByLabelText(/maximum/i);
    const startButton = screen.getByRole('button', { name: /training/i });
    
    fireEvent.change(durationInput, { target: { value: '60' } });
    fireEvent.change(minIntervalInput, { target: { value: '2' } });
    fireEvent.change(maxIntervalInput, { target: { value: '5' } });
    
    // Submit form
    fireEvent.click(startButton);
    
    // Training session should now be visible
    expect(screen.getByTestId('visual-flash')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stop|lopeta/i })).toBeInTheDocument();
    
    // Session configuration should not be visible
    expect(screen.queryByLabelText(/duration/i)).not.toBeInTheDocument();
  });

  test('switches back to session configuration when session is stopped', () => {
    render(<App />);
    
    // Start session
    const durationInput = screen.getByLabelText(/duration/i);
    const minIntervalInput = screen.getByLabelText(/minimum/i);
    const maxIntervalInput = screen.getByLabelText(/maximum/i);
    const startButton = screen.getByRole('button', { name: /training/i });
    
    fireEvent.change(durationInput, { target: { value: '60' } });
    fireEvent.change(minIntervalInput, { target: { value: '2' } });
    fireEvent.change(maxIntervalInput, { target: { value: '5' } });
    fireEvent.click(startButton);
    
    // Stop session
    const stopButton = screen.getByRole('button', { name: /stop|lopeta/i });
    fireEvent.click(stopButton);
    
    // Session configuration should be visible again
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/minimum/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maximum/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /training/i })).toBeInTheDocument();
  });
  
  test('changes language when language selector is used', () => {
    render(<App />);
    
    // Initial language is Finnish by default
    expect(screen.getByText(/Harjoituksen Asetukset/i)).toBeInTheDocument();
    
    // Change language to English
    const languageSelector = screen.getByLabelText(/kieli/i);
    fireEvent.change(languageSelector, { target: { value: 'en' } });
    
    // UI should now be in English
    expect(screen.getByText(/Training Configuration/i)).toBeInTheDocument();
    
    // Change back to Finnish
    fireEvent.change(languageSelector, { target: { value: 'fi' } });
    
    // UI should be back in Finnish
    expect(screen.getByText(/Harjoituksen Asetukset/i)).toBeInTheDocument();
  });
});
