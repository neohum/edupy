import { useMemo } from 'react';
import type { TypingLanguage } from '../types';
import { englishKeyboard, koreanKeyboard, fingerColors, findKeyForChar } from '../data/keyboardLayout';
import './KeyboardVisualizer.css';

interface KeyboardVisualizerProps {
  language: TypingLanguage;
  currentChar: string;
}

export default function KeyboardVisualizer({ language, currentChar }: KeyboardVisualizerProps) {
  const keyboard = language === 'korean' ? koreanKeyboard : englishKeyboard;

  const currentKey = useMemo(() => {
    if (!currentChar || currentChar === '\n') return null;
    return findKeyForChar(currentChar, language);
  }, [currentChar, language]);

  return (
    <div className="keyboard-visualizer">
      <div className="keyboard-container">
        <div className="keyboard">
          {keyboard.map((row, rowIndex) => (
            <div key={rowIndex} className={`keyboard-row row-${rowIndex + 1}`}>
              {row.map((key, keyIndex) => {
                const isActive = currentKey?.key === key.key;
                const fingerColor = fingerColors[key.finger];

                return (
                  <div
                    key={keyIndex}
                    className={`key ${isActive ? 'active' : ''} ${key.key === ' ' ? 'spacebar' : ''}`}
                    style={{
                      backgroundColor: isActive ? fingerColor : '#fff',
                      borderColor: fingerColor,
                      color: isActive ? '#fff' : '#333',
                    }}
                  >
                    {key.key === ' ' ? 'Space' : key.key}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

