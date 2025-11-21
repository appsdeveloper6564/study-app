import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  atOptions: {
    key: string;
    format: string;
    height: number;
    width: number;
    params: Record<string, any>;
  };
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ atOptions, className }) => {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current) return;

    // Adsterra scripts typically use document.write which doesn't work in React after hydration.
    // We must render it inside an isolated iframe.
    const iframe = document.createElement('iframe');
    iframe.width = `${atOptions.width}`;
    iframe.height = `${atOptions.height}`;
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.display = 'block';
    iframe.style.margin = '0 auto';
    iframe.scrolling = 'no';

    // Clear previous content
    bannerRef.current.innerHTML = '';
    bannerRef.current.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head><base target="_blank" /></head>
          <body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;">
            <script type="text/javascript">
              atOptions = ${JSON.stringify(atOptions)};
            </script>
            <script type="text/javascript" src="//www.highperformanceformat.com/${atOptions.key}/invoke.js"></script>
          </body>
        </html>
      `);
      doc.close();
    }
  }, [atOptions]);

  return (
    <div 
      ref={bannerRef} 
      className={`my-4 flex justify-center ${className || ''}`} 
      style={{ minHeight: atOptions.height }}
    />
  );
};

export default AdBanner;