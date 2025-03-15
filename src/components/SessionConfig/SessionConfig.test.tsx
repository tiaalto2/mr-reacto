import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SessionConfig from '../SessionConfig/SessionConfig';
import { LanguageProvider } from '../../i18n/LanguageContext';

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

// Helper to wrap component with language provider
const renderWithLanguage = (ui: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {ui}
    </LanguageProvider>
  );
};

describe('SessionConfig Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('renders session configuration form with default values when no saved data', () => {
    renderWithLanguage(<SessionConfig onStartSession={jest.fn()} />);
    
    // Check if all form elements are present with default values
    const durationInput = screen.getByLabelText(/duration|kesto/i) as HTMLInputElement;
    const minIntervalInput = screen.getByLabelText(/minimi|minimum/i) as HTMLInputElement;
    const maxIntervalInput = screen.getByLabelText(/maksimi|maximum/i) as HTMLInputElement;
    
    expect(durationInput.value).toBe('60');
    expect(minIntervalInput.value).toBe('2');
    expect(maxIntervalInput.value).toBe('5');
    expect(screen.getByRole('button', { name: /aloita|start/i })).toBeInTheDocument();
    
    // Check for language selector
    expect(screen.getByLabelText(/kieli|language/i)).toBeInTheDocument();
  });

  test('loads saved configuration values from localStorage', () => {
    // Setup localStorage with saved values
    const savedConfig = {
      duration: 120,
      minInterval: 3,
      maxInterval: 8
    };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedConfig));
    
    renderWithLanguage(<SessionConfig onStartSession={jest.fn()} />);
    
    // Check if values are loaded from localStorage
    const durationInput = screen.getByLabelText(/duration|kesto/i) as HTMLInputElement;
    const minIntervalInput = screen.getByLabelText(/minimi|minimum/i) as HTMLInputElement;
    const maxIntervalInput = screen.getByLabelText(/maksimi|maximum/i) as HTMLInputElement;
    
    expect(durationInput.value).toBe('120');
    expect(minIntervalInput.value).toBe('3');
    expect(maxIntervalInput.value).toBe('8');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('mr-reacto-config');
  });

  test('validates session duration between 30 seconds and 60 minutes', () => {
    renderWithLanguage(<SessionConfig onStartSession={jest.fn()} />);
    
    const durationInput = screen.getByLabelText(/duration|kesto/i);
    
    // Test below minimum
    fireEvent.change(durationInput, { target: { value: '29' } });
    fireEvent.blur(durationInput);
    // Both possible error messages (FI/EN)
    expect(screen.getByText(/vähintään 30 sekuntia|at least 30 seconds/i)).toBeInTheDocument();
    
    // Test above maximum
    fireEvent.change(durationInput, { target: { value: '3601' } });
    fireEvent.blur(durationInput);
    expect(screen.getByText(/ei voi ylittää 60 minuuttia|cannot exceed 60 minutes/i)).toBeInTheDocument();
    
    // Test valid values
    fireEvent.change(durationInput, { target: { value: '300' } });
    fireEvent.blur(durationInput);
    expect(screen.queryByText(/vähintään 30 sekuntia|at least 30 seconds/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ei voi ylittää 60 minuuttia|cannot exceed 60 minutes/i)).not.toBeInTheDocument();
  });

  test('validates minimum interval is positive', () => {
    renderWithLanguage(<SessionConfig onStartSession={jest.fn()} />);
    
    const minIntervalInput = screen.getByLabelText(/minimi|minimum/i);
    
    // Test negative value
    fireEvent.change(minIntervalInput, { target: { value: '-1' } });
    fireEvent.blur(minIntervalInput);
    expect(screen.getByText(/positiivinen|positive/i)).toBeInTheDocument();
    
    // Test valid value
    fireEvent.change(minIntervalInput, { target: { value: '1' } });
    fireEvent.blur(minIntervalInput);
    expect(screen.queryByText(/positiivinen|positive/i)).not.toBeInTheDocument();
  });

  test('validates maximum interval is greater than minimum interval', () => {
    renderWithLanguage(<SessionConfig onStartSession={jest.fn()} />);
    
    const minIntervalInput = screen.getByLabelText(/minimi|minimum/i);
    const maxIntervalInput = screen.getByLabelText(/maksimi|maximum/i);
    
    // Set minimum interval
    fireEvent.change(minIntervalInput, { target: { value: '5' } });
    
    // Test max interval less than min interval
    fireEvent.change(maxIntervalInput, { target: { value: '4' } });
    fireEvent.blur(maxIntervalInput);
    expect(screen.getByText(/suurempi kuin|greater than/i)).toBeInTheDocument();
    
    // Test valid max interval
    fireEvent.change(maxIntervalInput, { target: { value: '10' } });
    fireEvent.blur(maxIntervalInput);
    expect(screen.queryByText(/suurempi kuin|greater than/i)).not.toBeInTheDocument();
  });

  test('calls onStartSession with correct values when form is submitted', () => {
    const onStartSessionMock = jest.fn();
    renderWithLanguage(<SessionConfig onStartSession={onStartSessionMock} />);
    
    // Fill out form
    fireEvent.change(screen.getByLabelText(/duration|kesto/i), { target: { value: '300' } });
    fireEvent.change(screen.getByLabelText(/minimi|minimum/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/maksimi|maximum/i), { target: { value: '5' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /aloita|start/i }));
    
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
    renderWithLanguage(<SessionConfig onStartSession={jest.fn()} />);
    
    // Update values to valid configuration
    fireEvent.change(screen.getByLabelText(/duration|kesto/i), { target: { value: '180' } });
    fireEvent.change(screen.getByLabelText(/minimi|minimum/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/maksimi|maximum/i), { target: { value: '7' } });
    
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
    renderWithLanguage(<SessionConfig onStartSession={jest.fn()} />);
    
    // Clear previous calls to setItem (from initial component render)
    jest.clearAllMocks();
    
    // Set an invalid configuration (min > max)
    fireEvent.change(screen.getByLabelText(/minimi|minimum/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/maksimi|maximum/i), { target: { value: '5' } });
    
    // localStorage.setItem should not have been called with the invalid config
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });
  
  test('language can be changed via selector', () => {
    renderWithLanguage(<SessionConfig onStartSession={jest.fn()} />);
    
    // Default language is Finnish
    expect(screen.getByText(/Harjoituksen Asetukset/i)).toBeInTheDocument();
    
    // Change language to English
    const languageSelector = screen.getByLabelText(/kieli/i);
    fireEvent.change(languageSelector, { target: { value: 'en' } });
    
    // Text should be in English now
    expect(screen.getByText(/Training Configuration/i)).toBeInTheDocument();
    
    // Check that the change is saved to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('mr-reacto-language', 'en');
  });
}); 
