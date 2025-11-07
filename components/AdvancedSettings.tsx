import React, { useState } from 'react';
import { SettingsIcon, ChevronDownIcon } from './IconComponents';

export interface AdvancedSettingsData {
  style: string;
  mood: string;
  complexity: 'simple' | 'detailed' | 'highly-detailed';
}

interface AdvancedSettingsProps {
  settings: AdvancedSettingsData;
  onChange: (newSettings: AdvancedSettingsData) => void;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ settings, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700/50 rounded-xl transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Advanced Settings
          </h2>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700/50 space-y-4">
          <div>
            <label htmlFor="style" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Style
            </label>
            <input
              type="text"
              name="style"
              id="style"
              value={settings.style}
              onChange={handleChange}
              placeholder="e.g., Photorealistic, Anime, Oil painting"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label htmlFor="mood" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mood
            </label>
            <input
              type="text"
              name="mood"
              id="mood"
              value={settings.mood}
              onChange={handleChange}
              placeholder="e.g., Cinematic, joyful, dark, mysterious"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label htmlFor="complexity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Complexity
            </label>
            <select
              name="complexity"
              id="complexity"
              value={settings.complexity}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500 transition"
            >
              <option value="simple">Simple</option>
              <option value="detailed">Detailed</option>
              <option value="highly-detailed">Highly Detailed</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};