import React, { useEffect } from 'react';

// Extend the Window interface to include adsbygoogle
declare global {
  interface Window {
    adsbygoogle?: { [key: string]: unknown }[];
  }
}

const GoogleAd: React.FC = () => {
  useEffect(() => {
    // We wrap the ad push in a timeout to ensure the component has mounted
    // and the browser has had time to calculate the container's width.
    // This prevents the common "No slot size for availableWidth=0" error.
    const timer = setTimeout(() => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          console.error("AdSense error:", e);
        }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="my-6 text-center bg-gray-200 dark:bg-gray-800 rounded-lg p-4 min-h-[100px] flex items-center justify-center w-full">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // IMPORTANT: Replace with your own publisher ID
        data-ad-slot="YYYYYYYYYY" // IMPORTANT: Replace with your own ad slot ID
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default GoogleAd;