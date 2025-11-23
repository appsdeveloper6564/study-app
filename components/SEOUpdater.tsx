import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEOUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    // Your specific domain
    const baseUrl = 'https://studysmartandlearn.vercel.app';
    
    // Construct the canonical URL
    // Remove trailing slash if present for consistency, unless it's root
    let path = location.pathname;
    if (path !== '/' && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    
    const fullUrl = `${baseUrl}${path}`;

    // Update the existing canonical tag or create a new one
    let link = document.querySelector("link[rel='canonical']");
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', fullUrl);

    // Log for debugging (optional)
    // console.log('Updated Canonical URL:', fullUrl);
  }, [location]);

  return null;
};

export default SEOUpdater;