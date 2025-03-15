import React from 'react';
import { useLanguage, Language } from '../../i18n/LanguageContext';
import './LanguageSelector.css';

const LanguageSelector: React.FC = () => {
  const { language, t, setLanguage } = useLanguage();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value as Language);
  };

  return (
    <div className="language-selector">
      <label htmlFor="language-select">{t.language}:</label>
      <select 
        id="language-select" 
        value={language} 
        onChange={handleChange}
        aria-label={t.language}
      >
        <option value="fi">{t.finnish}</option>
        <option value="en">{t.english}</option>
      </select>
    </div>
  );
};

export default LanguageSelector; 
