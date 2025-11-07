import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { PromptDisplay } from './components/PromptDisplay';
import { PromptHistory } from './components/PromptHistory';
import { AdvancedSettings, AdvancedSettingsData } from './components/AdvancedSettings';
import { WatermarkSettings, WatermarkSettingsData } from './components/WatermarkSettings';
import { generatePromptFromImage, GenerationResult } from './services/geminiService';
import { SparklesIcon } from './components/IconComponents';
import GoogleAd from './components/GoogleAd';
import { ThemeToggle } from './components/ThemeToggle';

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'light';
};


const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUrlLoading, setIsUrlLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [promptHistory, setPromptHistory] = useState<GenerationResult[]>([]);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettingsData>({
    style: '',
    mood: '',
    complexity: 'detailed',
  });
  const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettingsData>({
    enabled: false,
    text: 'Your Watermark',
    position: 'bottom-right',
    fontSize: 24,
    color: '#ffffff',
    opacity: 0.5,
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  // Load from localStorage on initial mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('promptHistory');
      if (savedHistory) {
        setPromptHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load prompt history from localStorage", e);
      setPromptHistory([]);
    }
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    try {
      localStorage.setItem('promptHistory', JSON.stringify(promptHistory));
    } catch (e) {
      console.error("Failed to save prompt history to localStorage", e);
    }
  }, [promptHistory]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('share');

    if (sharedData) {
      try {
        const decodedJson = atob(sharedData);
        const payload = JSON.parse(decodedJson);

        if (payload.data && payload.settings) {
          const generationResult: GenerationResult = payload.data;
          const advancedSettingsData: AdvancedSettingsData = payload.settings;

          setGeneratedData(generationResult);
          setAdvancedSettings(advancedSettingsData);
        } else {
          throw new Error("Invalid share data structure");
        }
      } catch (e) {
        console.error("Failed to decode share data from URL", e);
        setError("The shared link appears to be invalid or corrupted.");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on initial render
  
  useEffect(() => {
    if (!imageFile) {
      setProcessedImageUrl(null);
      return;
    }

    const image = new Image();
    image.src = URL.createObjectURL(imageFile);
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw original image
      ctx.drawImage(image, 0, 0);

      // Apply watermark if enabled
      if (watermarkSettings.enabled && watermarkSettings.text) {
        const { text, fontSize, color, opacity, position } = watermarkSettings;
        
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const margin = 10 + fontSize;

        switch (position) {
            case 'top-left':
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText(text, margin, margin);
                break;
            case 'top-center':
                ctx.textBaseline = 'top';
                ctx.fillText(text, canvas.width / 2, margin);
                break;
            case 'top-right':
                ctx.textAlign = 'right';
                ctx.textBaseline = 'top';
                ctx.fillText(text, canvas.width - margin, margin);
                break;
            case 'middle-left':
                ctx.textAlign = 'left';
                ctx.fillText(text, margin, canvas.height / 2);
                break;
            case 'center':
                ctx.fillText(text, canvas.width / 2, canvas.height / 2);
                break;
            case 'middle-right':
                ctx.textAlign = 'right';
                ctx.fillText(text, canvas.width - margin, canvas.height / 2);
                break;
            case 'bottom-left':
                ctx.textAlign = 'left';
                ctx.textBaseline = 'bottom';
                ctx.fillText(text, margin, canvas.height - margin);
                break;
            case 'bottom-center':
                ctx.textBaseline = 'bottom';
                ctx.fillText(text, canvas.width / 2, canvas.height - margin);
                break;
            case 'bottom-right':
                ctx.textAlign = 'right';
                ctx.textBaseline = 'bottom';
                ctx.fillText(text, canvas.width - margin, canvas.height - margin);
                break;
        }
      }
      
      setProcessedImageUrl(canvas.toDataURL(imageFile.type));
    };
    
    return () => {
        URL.revokeObjectURL(image.src);
    };

  }, [imageFile, watermarkSettings]);
  
    useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    setGeneratedData(null);
    setError('');
  };

  const handleImageUrlSubmit = async (url: string) => {
    setImageFile(null);
    setGeneratedData(null);
    setError('');
    setIsUrlLoading(true);
    
    // Using a CORS proxy to bypass browser restrictions
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image via proxy. The URL might be invalid or the image server is down. (Status: ${response.status})`);
        }

        const blob = await response.blob();

        if (!blob.type || !blob.type.startsWith('image/')) {
            throw new Error('The URL did not return a valid image. It might be a webpage link or a broken URL.');
        }

        let filename = 'image-from-url.jpg';
        try {
            // Use original URL to extract a filename
            const urlObject = new URL(url);
            const pathname = urlObject.pathname;
            const lastSegment = pathname.substring(pathname.lastIndexOf('/') + 1);
            if (lastSegment) {
              filename = lastSegment.replace(/[^a-zA-Z0-9._-]/g, '_'); // Sanitize
            }
        } catch (e) { /* ignore invalid urls, default filename is fine */ }

        const file = new File([blob], filename, { type: blob.type });
        handleImageUpload(file);
    } catch (err) {
        console.error("Error fetching image from URL:", err);
        let errorMessage;
        if (err instanceof TypeError && err.message.toLowerCase().includes('failed to fetch')) {
          // This is a network-level error.
          errorMessage = 'Could not load image. This may be due to a network error, an ad-blocker, or the image server being offline. Please check your connection and try another URL.';
        } else if (err instanceof Error) {
          // This will catch the custom errors thrown in the `try` block.
          errorMessage = err.message;
        } else {
          // Fallback for non-Error exceptions
          errorMessage = 'An unexpected error occurred while loading the image.';
        }
        setError(errorMessage);
    } finally {
        setIsUrlLoading(false);
    }
  };


  const dataUrlToBase64 = (dataUrl: string): string => {
    return dataUrl.split(',')[1];
  };

  const handleGeneratePrompt = useCallback(async () => {
    if (!imageFile || !processedImageUrl) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedData(null);

    try {
      const base64Image = dataUrlToBase64(processedImageUrl);
      const result = await generatePromptFromImage(base64Image, imageFile.type, advancedSettings);
      setGeneratedData(result);
    } catch (err) {
      console.error("Prompt Generation Error:", err);
      
      let specificError = 'An unexpected error occurred. Please try again.';

      if (!navigator.onLine) {
        specificError = 'You appear to be offline. Please check your internet connection.';
      } else if (err instanceof Error) {
        const msg = err.message.toLowerCase();
        if (msg.includes('api key')) {
            specificError = 'The API key is invalid or missing. Please check the configuration.';
        } else if (msg.includes('quota')) {
            specificError = 'The API usage limit has been reached. Please try again later.';
        } else if (msg.includes('network request failed') || msg.includes('failed to fetch')) {
            specificError = 'A network error occurred. Please check your connection and try again.';
        } else {
            // Use the specific error message from our service or the API if it's informative
            specificError = err.message;
        }
      }
      
      setError(specificError);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, processedImageUrl, advancedSettings]);

  const handleSelectPrompt = (data: GenerationResult) => {
    setGeneratedData(data);
  };
  
  const handleSettingsChange = (newSettings: AdvancedSettingsData) => {
    setAdvancedSettings(newSettings);
  };
  
  const handleWatermarkChange = (newSettings: WatermarkSettingsData) => {
    setWatermarkSettings(newSettings);
  };
  
  const handleSavePrompt = (dataToSave: GenerationResult) => {
    setPromptHistory(prevHistory => {
        // Remove any existing version of this prompt from the history
        const filteredHistory = prevHistory.filter(p => p.prompt !== dataToSave.prompt);
        // Add the new version (with a fresh timestamp) to the top of the list
        const newEntry = { ...dataToSave, timestamp: Date.now() };
        return [newEntry, ...filteredHistory];
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-10 dark:opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'}}></div>
        </div>
        
        <header className="text-center py-6 relative">
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center justify-center gap-3">
            <SparklesIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
            Prompt Vision AI
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Turn any image into a creative AI prompt.</p>
        </header>
        
        <main className="container mx-auto max-w-6xl p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col gap-6">
              <ImageUploader 
                onImageUpload={handleImageUpload}
                onImageUrlSubmit={handleImageUrlSubmit}
                imageUrl={processedImageUrl}
                isLoading={isUrlLoading}
              />
              <WatermarkSettings settings={watermarkSettings} onChange={handleWatermarkChange} />
              <AdvancedSettings settings={advancedSettings} onChange={handleSettingsChange} />
              <button 
                onClick={handleGeneratePrompt}
                disabled={!imageFile || isLoading || isUrlLoading}
                className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-900 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 ease-in-out flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Generate Prompt
                  </>
                )}
              </button>
              <GoogleAd />
            </div>
            
            <div className="flex flex-col gap-8">
              <PromptDisplay 
                data={generatedData} 
                isLoading={isLoading} 
                error={error}
                onRetry={handleGeneratePrompt}
                onSave={handleSavePrompt}
                settings={advancedSettings}
              />
              <PromptHistory history={promptHistory} onSelect={handleSelectPrompt} />
            </div>
          </div>
        </main>
        
        <footer className="text-center py-8 mt-8">
            <p className="text-gray-500">Powered by Gemini</p>
        </footer>

        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-10 dark:opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style={{clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'}}></div>
        </div>
      </div>
    </div>
  );
};

export default App;