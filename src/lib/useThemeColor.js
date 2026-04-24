import { useEffect } from 'react';

export default function useThemeColor(color) {
  useEffect(() => {
    const originalBodyColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = color;

    let metaTheme = document.querySelector('meta[name="theme-color"]');
    let originalMetaColor = '';
    
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.name = 'theme-color';
      document.head.appendChild(metaTheme);
    } else {
      originalMetaColor = metaTheme.content;
    }
    
    metaTheme.content = color;

    return () => {
      document.body.style.backgroundColor = originalBodyColor;
      if (originalMetaColor) {
        metaTheme.content = originalMetaColor;
      } else if (metaTheme.parentNode) {
        metaTheme.parentNode.removeChild(metaTheme);
      }
    };
  }, [color]);
}
