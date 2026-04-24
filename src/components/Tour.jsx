import { useState, useLayoutEffect, useEffect, useRef } from 'react';
import './Tour.css';

export default function Tour({ steps, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const targetEl = useRef(null);

  const step = steps[currentStep];

  useLayoutEffect(() => {
    // 1. Find the target element
    const selectors = step.target.split(',').map(s => s.trim());
    let el = null;
    for (const sel of selectors) {
      const found = document.querySelector(sel);
      if (found && found.getBoundingClientRect().width > 0) {
        el = found;
        break;
      }
    }
    targetEl.current = el;

    // 2. Perform smooth scroll to target
    if (el) {
      const rect = el.getBoundingClientRect();
      const yOffset = -80; 
      const y = rect.top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      setTargetRect(null);
    }
  }, [currentStep, step]);

  // 3. Continuously track the exact screen position
  useEffect(() => {
    let animationFrameId;
    
    const updateBox = () => {
      if (targetEl.current) {
        const rect = targetEl.current.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      }
    };

    const loop = () => {
      updateBox();
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    window.addEventListener('resize', updateBox);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateBox);
    };
  }, [currentStep, step]);

  if (!targetRect) return null;

  const isMobile = window.innerWidth <= 768;
  const renderTop = targetRect.top;
  const renderLeft = targetRect.left;

  // Tooltip positioning for desktop
  let tooltipTop = renderTop + targetRect.height + 16;
  if (tooltipTop + 200 > window.innerHeight) {
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
