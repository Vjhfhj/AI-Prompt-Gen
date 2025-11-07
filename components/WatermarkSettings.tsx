import React, { useState } from 'react';
import { WatermarkIcon, ChevronDownIcon } from './IconComponents';

export interface WatermarkSettingsData {
  enabled: boolean;
  text: string;
  position: 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  fontSize: number;
  color: string;
  opacity: number;
}

interface WatermarkSettingsProps {
  settings: WatermarkSettingsData;
  onChange: (newSettings: WatermarkSettingsData) => void;
}

export const WatermarkSettings: React.FC<WatermarkSettingsProps> = ({ settings, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: string | number | boolean = value;
    
    if (type === 'checkbox') {
        finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number' || type === 'range') {
        finalValue = parseFloat(value);
    }
    
    onChange({
      ...settings,
      [name]: finalValue,
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
          <WatermarkIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Watermark
          </h2>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700/50 space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable Watermark
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    name="enabled"
                    id="enabled"
                    checked={settings.enabled}
                    onChange={handleChange}
                    className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          {settings.enabled && (
            <>
              <div>
                <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Watermark Text
                </label>
                <input
                  type="text"
                  name="text"
                  id="text"
                  value={settings.text}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Position
                </label>
                <select
                  name="position"
                  id="position"
                  value={settings.position}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-center">Top Center</option>
                  <option value="top-right">Top Right</option>
                  <option value="middle-left">Middle Left</option>
                  <option value="center">Center</option>
                  <option value="middle-right">Middle Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-center">Bottom Center</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Font Size
                    </label>
                     <input
                      type="number"
                      name="fontSize"
                      id="fontSize"
                      value={settings.fontSize}
                      onChange={handleChange}
                      min="8"
                      max="128"
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                  </div>
                   <div>
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Color
                    </label>
                     <input
                      type="color"
                      name="color"
                      id="color"
                      value={settings.color}
                      onChange={handleChange}
                      className="w-full h-10 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-1 cursor-pointer"
                    />
                  </div>
              </div>

              <div>
                <label htmlFor="opacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Opacity ({Math.round(settings.opacity * 100)}%)
                </label>
                 <input
                  type="range"
                  name="opacity"
                  id="opacity"
                  value={settings.opacity}
                  onChange={handleChange}
                  min="0"
                  max="1"
                  step="0.05"
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};