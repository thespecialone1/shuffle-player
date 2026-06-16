import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const delay = ms => new Promise(res => setTimeout(res, ms));

function simulateTyping(inputElement, text, onComplete) {
  let i = 0;
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  
  const typeChar = () => {
    if (i < text.length) {
      nativeInputValueSetter.call(inputElement, text.substring(0, i + 1));
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      i++;
      setTimeout(typeChar, 100 + Math.random() * 100);
    } else {
      setTimeout(onComplete, 500);
    }
  };
  typeChar();
}

export default function DemoTour() {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [tooltipText, setTooltipText] = useState("Welcome to Shuffle! This is a guided demo.");
  const [position, setPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only run the tour once per session
    if (sessionStorage.getItem('demoTourComplete')) {
      setIsVisible(false);
      return;
    }
    
    // Start the tour sequence
    runTour();
  }, []);

  const runTour = async () => {
    await delay(1000);

    // Step 1: Welcome
    setTooltipText("Welcome to the Shuffle Demo! Let's explore how to find and download music.");
    await delay(3000);

    // Step 2: Go to Search
    setTooltipText("First, let's search for an artist on the Soulseek network...");
    navigate('/search');
    await delay(1000);

    // Step 3: Type in search
    const searchInput = document.querySelector('input[placeholder="What do you want to listen to?"]');
    if (searchInput) {
      const rect = searchInput.getBoundingClientRect();
      setPosition({ top: `${rect.bottom + 20}px`, left: '50%', transform: 'translateX(-50%)' });
      setTooltipText("Searching the peer-to-peer network...");
      
      await new Promise(resolve => simulateTyping(searchInput, "The Weeknd", resolve));
      await delay(2000); // Wait for results
    }

    // Step 4: Highlight Download Button
    const downloadBtns = document.querySelectorAll('button');
    const dlBtn = Array.from(downloadBtns).find(b => b.innerHTML.includes('lucide-download') || b.querySelector('svg')); 
    // We will specifically look for the soulseek download button by its visual position or icon
    // In Search.jsx, the download button is inside Soulseek Network section.
    
    // Let's just reposition to the center for a generic message since DOM targeting can be brittle
    setPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
    setTooltipText("Found a high-quality track on Soulseek! Downloading automatically...");
    
    // Simulate clicking the first download button in the Soulseek list
    const lists = document.querySelectorAll('.flex-col.gap-2 > div');
    const soulseekRow = Array.from(lists).find(el => el.textContent.includes('Blinding Lights'));
    if (soulseekRow) {
      const btn = soulseekRow.querySelector('button');
      if (btn) btn.click();
    }
    
    await delay(2500); // Wait for mock download to finish

    // Step 5: Go to Library
    setTooltipText("Download complete! Let's go to your library to sync it.");
    navigate('/');
    await delay(1000);

    // Step 6: Highlight Sync Button
    const syncBtn = document.querySelector('button[title="Sync Music"]');
    if (syncBtn) {
      const rect = syncBtn.getBoundingClientRect();
      setPosition({ top: `${rect.bottom + 20}px`, left: `${rect.left}px`, transform: 'translateX(-50%)' });
      setTooltipText("Syncing your local library folder...");
      syncBtn.click();
    } else {
      // Fallback if button not found by title
      setPosition({ top: '100px', left: '50%', transform: 'translateX(-50%)' });
      setTooltipText("Syncing your local library folder...");
      // Programmatically trigger sync since we are in Demo mode anyway
      const syncHeaders = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Library'));
      if(syncHeaders.length > 0) syncHeaders[0].click(); // Just in case
    }

    await delay(2500);

    // Step 7: Done
    setPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
    setTooltipText("The track is now in your library! Feel free to play it and explore the app on your own. Enjoy!");
    
    await delay(4000);
    
    setIsVisible(false);
    sessionStorage.setItem('demoTourComplete', 'true');
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Dim overlay */}
      <div className="fixed inset-0 bg-black/40 z-[9998] pointer-events-none transition-opacity duration-500" />
      
      {/* Tooltip */}
      <div 
        className="fixed z-[9999] pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={position}
      >
        <div className="bg-[var(--color-surface-2)]/90 backdrop-blur-xl border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] px-6 py-4 rounded-2xl shadow-2xl max-w-sm text-center font-display font-medium text-lg animate-in fade-in zoom-in-95">
          <div className="text-[var(--color-accent)] text-sm font-bold tracking-widest uppercase mb-2">Demo Tour</div>
          {tooltipText}
        </div>
      </div>
    </>
  );
}
