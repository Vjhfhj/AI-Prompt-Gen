import React from 'react';
import { HistoryIcon } from './IconComponents';
import { GenerationResult } from '../services/geminiService';

interface PromptHistoryProps {
  history: GenerationResult[];
  onSelect: (data: GenerationResult) => void;
}

export const PromptHistory: React.FC<PromptHistoryProps> = ({ history, onSelect }) => {
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <HistoryIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
        Prompt History
      </h2>
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700/50 rounded-xl max-h-60 overflow-y-auto">
        {history.length === 0 ? (
          <p className="p-6 text-center text-gray-500">Your saved prompts will appear here.</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700/50">
            {history.map((item, index) => (
              <li key={item.timestamp || index}>
                <button
                  onClick={() => onSelect(item)}
                  className="w-full text-left p-4 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors duration-200 group"
                >
                  <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 truncate" title={item.prompt}>
                    {item.prompt}
                  </p>
                  {item.timestamp && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};