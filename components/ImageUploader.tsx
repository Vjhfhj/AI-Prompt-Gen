import React, { useRef, useState, useCallback } from 'react';
import { UploadIcon, LinkIcon } from './IconComponents';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  onImageUrlSubmit: (url: string) => void;
  imageUrl: string | null;
  isLoading?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onImageUrlSubmit, imageUrl, isLoading = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onImageUpload(files[0]);
    }
  };
  
  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragEvents = useCallback((e: React.DragEvent<HTMLDivElement>, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e, false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onImageUpload(files[0]);
    }
  }, [onImageUpload, handleDragEvents]);

  const handleUrlFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (imageUrlInput.trim()) {
      onImageUrlSubmit(imageUrlInput.trim());
    }
  };

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrlInput(e.target.value);
  };

  return (
    <div className="w-full">
        <div 
          className={`relative w-full aspect-video border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ease-in-out bg-gray-50 dark:bg-white/5 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-gray-100 dark:hover:bg-white/10 ${isDragging ? 'border-indigo-500 dark:border-indigo-400 bg-gray-100 dark:bg-white/10' : 'border-gray-300 dark:border-gray-600'}`}
          onClick={handleContainerClick}
          onDragEnter={(e) => handleDragEvents(e, true)}
          onDragLeave={(e) => handleDragEvents(e, false)}
          onDragOver={(e) => handleDragEvents(e, true)}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            className="hidden" 
          />
          {imageUrl ? (
            <>
              <img src={imageUrl} alt="Uploaded preview" className="object-contain w-full h-full rounded-xl" />
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">Preview</div>
            </>
          ) : (
            <div className="text-center p-8">
              <UploadIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <span className="text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
              </h3>
              <p className="mt-1 text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
            </div>
          )}
        </div>

        <form onSubmit={handleUrlFormSubmit} className="mt-4 flex gap-2">
            <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LinkIcon className="w-5 h-5 text-gray-400" />
                </span>
                <input 
                    type="url"
                    value={imageUrlInput}
                    onChange={handleUrlInputChange}
                    onClick={(e) => e.stopPropagation()}
                    disabled={isLoading}
                    placeholder="Or paste image URL"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-10 pr-3 text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:opacity-50"
                />
            </div>
            <button
                type="submit"
                className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                disabled={!imageUrlInput.trim() || isLoading}
            >
                {isLoading ? 'Loading...' : 'Load'}
            </button>
        </form>
    </div>
  );
};