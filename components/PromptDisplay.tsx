import React, { useState, useEffect } from 'react';
import { CopyIcon, CheckIcon, ErrorIcon, RetryIcon, ShareIcon, SparklesIcon, MinusCircleIcon, TagIcon, SaveIcon } from './IconComponents';
import { GenerationResult } from '../services/geminiService';
import { AdvancedSettingsData } from './AdvancedSettings';

interface PromptDisplayProps {
  data: GenerationResult | null;
  isLoading: boolean;
  error: string;
  onRetry: () => void;
  onSave: (data: GenerationResult) => void;
  settings: AdvancedSettingsData;
}

type CopyStatus = 'prompt' | 'negative' | 'keywords' | null;

export const PromptDisplay: React.FC<PromptDisplayProps> = ({ data, isLoading, error, onRetry, onSave, settings }) => {
  const [copied, setCopied] = useState<CopyStatus>(null);
  const [shared, setShared] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    let timer: number;
    if (copied) {
      timer = window.setTimeout(() => setCopied(null), 2000);
    }
    return () => clearTimeout(timer);
  }, [copied]);
  
  useEffect(() => {
    let timer: number;
    if (shared) {
      timer = window.setTimeout(() => setShared(false), 2000);
    }
    return () => clearTimeout(timer);
  }, [shared]);

  useEffect(() => {
    let timer: number;
    if (justSaved) {
        timer = window.setTimeout(() => setJustSaved(false), 2000);
    }
    return () => clearTimeout(timer);
  }, [justSaved]);


  const handleCopy = (text: string, type: NonNullable<CopyStatus>) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(type);
    }
  };

  const handleShare = async () => {
    if (!data) return;

    const payload = {
      data: data,
      settings: settings,
    };

    try {
      const jsonString = JSON.stringify(payload);
      const encodedData = btoa(jsonString);
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodedData}`;
      
      const shareData = {
        title: 'Prompt from Prompt Vision AI',
        text: data.prompt,
        url: shareUrl,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(shareUrl);
        setShared(true);
      }
    } catch (error) {
        console.error("Failed to create share link:", error);
    }
  };

  const handleSave = () => {
    if (data) {
        onSave(data);
        setJustSaved(true);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 animate-pulse p-6">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center gap-4 p-6">
          <div className="flex items-center gap-3 text-red-500 dark:text-red-400">
            <ErrorIcon className="w-6 h-6 flex-shrink-0" />
            <p>{error}</p>
          </div>
          <button
            onClick={onRetry}
            className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center gap-2"
          >
            <RetryIcon className="w-5 h-5" />
            Retry
          </button>
        </div>
      );
    }

    if (data?.prompt) {
      const keywords = data.keywords ? data.keywords.split(',').map(k => k.trim()).filter(Boolean) : [];
      return (
        <div className="p-6 space-y-6">
          {/* Main Prompt */}
          <section>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                Main Prompt
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={justSaved}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={justSaved ? "Prompt saved" : "Save prompt"}
                  title={justSaved ? "Saved!" : "Save prompt"}
                >
                  {justSaved ? <CheckIcon className="w-5 h-5 text-green-500 dark:text-green-400" /> : <SaveIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
                </button>
                <button 
                  onClick={handleShare}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600/70 transition-colors"
                  aria-label="Share prompt"
                  title={shared ? "Link Copied!" : "Share"}
                >
                  {shared ? <CheckIcon className="w-5 h-5 text-green-500 dark:text-green-400" /> : <ShareIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
                </button>
                <button 
                  onClick={() => handleCopy(data.prompt, 'prompt')}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600/70 transition-colors"
                  aria-label="Copy prompt"
                  title={copied === 'prompt' ? "Copied!" : "Copy prompt"}
                >
                  {copied === 'prompt' ? <CheckIcon className="w-5 h-5 text-green-500 dark:text-green-400" /> : <CopyIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
                </button>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-black/20 p-4 rounded-md">{data.prompt}</p>
          </section>

          {/* Negative Prompt */}
          {data.negativePrompt && (
            <section>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MinusCircleIcon className="w-5 h-5 text-red-500 dark:text-red-400" />
                  Negative Prompt
                </h3>
                <button 
                  onClick={() => handleCopy(data.negativePrompt, 'negative')}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600/70 transition-colors"
                  aria-label="Copy negative prompt"
                  title={copied === 'negative' ? "Copied!" : "Copy negative prompt"}
                >
                  {copied === 'negative' ? <CheckIcon className="w-5 h-5 text-green-500 dark:text-green-400" /> : <CopyIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm bg-gray-50 dark:bg-black/20 p-4 rounded-md">{data.negativePrompt}</p>
            </section>
          )}

          {/* Keywords */}
          {keywords.length > 0 && (
            <section>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <TagIcon className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                  Keywords
                </h3>
                <button 
                  onClick={() => handleCopy(data.keywords, 'keywords')}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600/70 transition-colors"
                  aria-label="Copy keywords"
                  title={copied === 'keywords' ? "Copied!" : "Copy keywords"}
                >
                  {copied === 'keywords' ? <CheckIcon className="w-5 h-5 text-green-500 dark:text-green-400" /> : <CopyIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {keywords.map(keyword => (
                  <span key={keyword} className="bg-sky-100 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300 text-xs font-medium px-2.5 py-1 rounded-full border border-sky-200 dark:border-sky-500/30">
                    {keyword}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-center p-6">
        <p>Your generated prompt will appear here.</p>
      </div>
    );
  };

  return (
    <div className="relative bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl min-h-[200px] lg:min-h-full flex flex-col justify-center">
      {renderContent()}
    </div>
  );
};