import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../context/themes';
import './ThemeDropdown.css';

export default function ThemeDropdown() {
  const { currentTheme, currentThemeIndex, setThemeByIndex } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="theme-dropdown">
      <button
        className="theme-dropdown__toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="테마 변경"
      >
        <span className="theme-dropdown__icon"><i className="fi fi-rr-palette"></i></span>
        <span className="theme-dropdown__name">{currentTheme.name}</span>
        <span className="theme-dropdown__arrow"><i className={isOpen ? 'fi fi-rr-angle-up' : 'fi fi-rr-angle-down'}></i></span>
      </button>

      {isOpen && (
        <>
          <div
            className="theme-dropdown__backdrop"
            onClick={() => setIsOpen(false)}
          />
          <div className="theme-dropdown__menu">
            <div className="theme-dropdown__header">
              <span><i className="fi fi-rr-palette"></i> 테마 선택</span>
              <a href="/new" className="theme-dropdown__preview-link">
                미리보기 <i className="fi fi-rr-arrow-right"></i>
              </a>
            </div>
            <div className="theme-dropdown__list">
              {themes.map((theme, index) => (
                <button
                  key={theme.name}
                  className={`theme-dropdown__item ${
                    index === currentThemeIndex ? 'theme-dropdown__item--active' : ''
                  }`}
                  onClick={() => {
                    setThemeByIndex(index);
                    setIsOpen(false);
                  }}
                >
                  <div className="theme-dropdown__item-content">
                    <span className="theme-dropdown__item-name">{theme.name}</span>
                    <span className="theme-dropdown__item-vibe">{theme.vibe}</span>
                  </div>
                  <div className="theme-dropdown__item-palette">
                    {theme.palette.map((color, i) => (
                      <span
                        key={i}
                        className="theme-dropdown__color"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  {index === currentThemeIndex && (
                    <span className="theme-dropdown__check"><i className="fi fi-rr-check"></i></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
