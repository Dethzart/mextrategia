import { useState, useLayoutEffect, useEffect } from 'react';
import './Tour.css';

export default function Tour({ steps, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const step = steps[currentStep];

  const updateRect = () => {
    const selectors = step.target.split(',').map(s => s.trim());
    let el = null;
    for (const sel of selectors) {
      const found = document.querySelector(sel);
      if (found && found.getBoundingClientRect().width > 0) {
        el = found;
        break;
      }
    }

    if (el) {
      const rect = el.getBoundingClientRect();
      
      // Calculate global absolute position ignoring scroll initially
      setTargetRect({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
      
      // Scroll exactly to target with padding
      const yOffset = -80; // Offset for mobile headers or just breathing room
      const y = rect.top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      // Fallback if target is not found
      setTargetRect(null);
    }
  };

  useLayoutEffect(() => {
    // Wait for smooth scroll and paint
    const timer = setTimeout(updateRect, 100);
    window.addEventListener('resize', updateRect);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRect);
    };
  }, [currentStep, step]);

  // Recalculate on actual scroll to keep spotlight glued to element
  const [scrollY, setScrollY] = useState(window.scrollY);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!targetRect) return null;

  // Render position logic (for desktop)
  const isMobile = window.innerWidth <= 768;
  const renderTop = targetRect.top - scrollY;
  const renderLeft = targetRect.left - window.scrollX;

  // Tooltip positioning for desktop
  let tooltipTop = renderTop + targetRect.height + 16;
  if (tooltipTop + 200 > window.innerHeight) {
    // Show above if it overflows bottom
    tooltipTop = renderTop - 200;
  }

  return (
    <div className="tour-overlay">
      <div 
        className="tour-spotlight"
        style={{
          top: renderTop - 8,
          left: renderLeft - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
        }}
      />
      
      <div 
        className="tour-tooltip"
        style={!isMobile ? {
          top: tooltipTop,
          left: Math.max(16, renderLeft)
        } : {}}
      >
        <h3>{step.title}</h3>
        <p>{step.content}</p>
        <div className="tour-actions">
          <button className="tour-btn-skip" onClick={onClose}>Omitir</button>
          {currentStep < steps.length - 1 ? (
            <button className="tour-btn-next" onClick={() => setCurrentStep(c => c + 1)}>
              Siguiente
            </button>
          ) : (
            <button className="tour-btn-next" onClick={onClose}>
              Empezar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
