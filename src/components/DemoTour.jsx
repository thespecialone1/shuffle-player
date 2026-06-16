import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isTourActive, setIsTourActive] = useState(false);
  const [isPillVisible, setIsPillVisible] = useState(true);
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [isClicking, setIsClicking] = useState(false);
  const [tooltipText, setTooltipText] = useState("");
  
  const navigate = useNavigate();



  const moveMouseTo = async (selector, offsetX = 0, offsetY = 0) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    setMousePos({ x: rect.left + rect.width / 2 + offsetX, y: rect.top + rect.height / 2 + offsetY });
    await delay(1200); // Wait for mouse to travel
    return el;
  };

  const clickMouse = async (el) => {
    setIsClicking(true);
    await delay(150);
    setIsClicking(false);
    if (el) el.click();
    await delay(300);
  };

  const runTour = async () => {
    setIsPillVisible(false);
    setIsTourActive(true);
    
    // Initial position
    setMousePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    await delay(500);

    // 1. Go to Search
    setTooltipText("Navigating to Search...");
    const searchNav = await moveMouseTo('a[href="/search"]');
    if (searchNav) await clickMouse(searchNav);
    else navigate('/search');
    await delay(1000);

    // 2. Click Search Input
    setTooltipText("Searching Soulseek...");
    const searchInput = await moveMouseTo('input[type="text"]');
    if (searchInput) {
      await clickMouse(searchInput);
      await new Promise(resolve => simulateTyping(searchInput, "SoundHelix", resolve));
      await delay(2000); // Wait for fake results
    }

    // 3. Click Download
    setTooltipText("Downloading track...");
    // Find a download button inside the Soulseek list
    const lists = document.querySelectorAll('.flex-col.gap-2 > div');
    const soulseekRow = Array.from(lists).find(el => el.textContent.includes('SoundHelix'));
    let downloadBtn = null;
    if (soulseekRow) downloadBtn = soulseekRow.querySelector('button');
    if (!downloadBtn) downloadBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerHTML.includes('lucide-download'));
    
    if (downloadBtn) {
      const rect = downloadBtn.getBoundingClientRect();
      setMousePos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      await delay(1200);
      await clickMouse(downloadBtn);
      await delay(2500); // wait for simulated download
    }

    // 4. Go to Library
    setTooltipText("Going to Library to Sync...");
    const libNav = await moveMouseTo('a[href="/library"]');
    if (libNav) await clickMouse(libNav);
    else navigate('/library');
    await delay(1000);

    // 5. Click Sync
    setTooltipText("Syncing local files...");
    const syncBtn = Array.from(document.querySelectorAll('button')).find(b => b.title === "Sync Music" || b.textContent.includes('Sync'));
    if (syncBtn) {
      const rect = syncBtn.getBoundingClientRect();
      setMousePos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      await delay(1200);
      await clickMouse(syncBtn);
      await delay(2500);
    }

    // 6. Go Home
    setTooltipText("Tour complete! Enjoy the app.");
    const homeNav = await moveMouseTo('a[href="/browse"]');
    if (homeNav) await clickMouse(homeNav);
    else navigate('/browse');
    
    await delay(3000);
    setIsTourActive(false);
  };

  return (
    <>
      <AnimatePresence>
        {isPillVisible && !isTourActive && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999]"
          >
            <button 
              onClick={runTour}
              className="bg-[var(--color-surface-2)]/90 hover:bg-[var(--color-surface-3)] backdrop-blur-md border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] px-6 py-3 rounded-full shadow-lg font-display text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer group"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
              <span>Enable Demo Tour</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTourActive && (
          <>
            <motion.div
              initial={{ x: window.innerWidth / 2, y: window.innerHeight / 2 }}
              animate={{ 
                x: mousePos.x, 
                y: mousePos.y,
                scale: isClicking ? 0.8 : 1 
              }}
              className="fixed z-[10000] pointer-events-none drop-shadow-md origin-top-left"
              transition={{ 
                x: { type: 'spring', damping: 25, stiffness: 120, mass: 0.8 },
                y: { type: 'spring', damping: 25, stiffness: 120, mass: 0.8 },
                scale: { duration: 0.1 }
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.5 3.21V20.8C5.5 21.46 6.27 21.82 6.78 21.39L10.5 18.23C10.74 18.03 11.05 17.92 11.37 17.92H18.5C19.19 17.92 19.56 17.11 19.1 16.59L6.1 2.05C5.74 1.64 5.5 1.93 5.5 3.21Z" fill="black" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-24 sm:bottom-12 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
            >
              <div className="bg-black/80 backdrop-blur-md border border-[var(--color-border-subtle)] text-white px-6 py-3 rounded-2xl shadow-2xl font-display font-medium text-center">
                {tooltipText}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
