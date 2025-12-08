import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface Position {
  x: number;
  y: number;
}

const CustomCursor = () => {
  const location = useLocation();
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  // Hide custom cursor in dashboard pages
  const hideCursorPaths = ['/admin', '/login'];
  const shouldHideCursor = hideCursorPaths.some(path => 
    location.pathname.startsWith(path)
  );
  
  // Hide custom cursor on mobile and tablet - show only on desktop
  const [isMobile, setIsMobile] = useState(true); // Default to true for SSR

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 1024);
      }
    };
    
    checkMobile();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  useEffect(() => {
    if (shouldHideCursor || isMobile || typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleClick = (e: MouseEvent) => {
      setIsClicking(true);
      
      const newRipple = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY
      };
      setRipples(prev => [...prev, newRipple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 300);
      
      setTimeout(() => setIsClicking(false), 100);
    };

    const handleTouchStart = (e: TouchEvent) => {
      setIsClicking(true);
      
      const touch = e.touches[0];
      if (touch) {
        const newRipple = {
          id: Date.now(),
          x: touch.clientX,
          y: touch.clientY
        };
        setRipples(prev => [...prev, newRipple]);
        
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
        }, 300);
      }
      
      setTimeout(() => setIsClicking(false), 100);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    try {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('click', handleClick);
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('mouseleave', handleMouseLeave);
      document.addEventListener('mouseenter', handleMouseEnter);
    } catch (error) {
      console.warn('CustomCursor: Failed to add event listeners', error);
    }

    return () => {
      try {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('click', handleClick);
        document.removeEventListener('mousedown', handleClick);
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('mouseleave', handleMouseLeave);
        document.removeEventListener('mouseenter', handleMouseEnter);
      } catch (error) {
        console.warn('CustomCursor: Failed to remove event listeners', error);
      }
    };
  }, [shouldHideCursor, location.pathname]);

  if (shouldHideCursor || isMobile) {
    return null;
  }

  return (
    <>
      {isVisible && (
        <>
          {/* Main cursor — refined with #d9a890 gradient & elegant glow */}
          <div
            className={`fixed pointer-events-none z-[9999] ${
              isClicking ? 'animate-professionalPulse' : ''
            }`}
            style={{
              left: position.x - 20,
              top: position.y - 20,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #d9a890, #c58b70, #b87a5e)', // Warm, sophisticated orange gradient
              boxShadow: '0 0 20px rgba(217, 168, 144, 0.45), inset 0 0 20px rgba(255, 255, 255, 0.15)',
              transform: isClicking ? 'scale(1.5)' : 'scale(1)',
              opacity: isClicking ? '0.95' : '0.85',
              transition: 'transform 0.2s ease, opacity 0.2s ease',
            }}
          >
            {/* Inner subtle glow — soft white-to-transparent radial */}
            <div
              className="absolute inset-2 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, transparent 75%)',
              }}
            />
            
            {/* Center dot — refined with ivory-white for contrast */}
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#fffdf8', // Warm off-white
                boxShadow: '0 0 8px rgba(245, 235, 220, 0.9)', // Soft ivory glow
              }}
            />
          </div>
          
          {/* Outer ring — elegant & subtle */}
          <div
            className="fixed pointer-events-none z-[9998]"
            style={{
              left: position.x - 30,
              top: position.y - 30,
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '1px solid rgba(217, 168, 144, 0.28)', // #d9a890 @ 28% opacity
              transform: isClicking ? 'scale(2)' : 'scale(1)',
              opacity: isClicking ? '0.25' : '0.5',
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
            }}
          />
        </>
      )}
      
      {/* Ripple effects — warm orange accent */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="fixed pointer-events-none z-[9997] animate-ripple"
          style={{
            left: ripple.x - 25,
            top: ripple.y - 25,
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: '2px solid #d9a890',
            opacity: '0.5',
            animation: 'ripple 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) forwards',
          }}
        />
      ))}
    </>
  );
};

export default CustomCursor;