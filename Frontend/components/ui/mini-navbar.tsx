"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun } from 'lucide-react';

const AnimatedNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const defaultTextColor = 'text-slate-600 dark:text-gray-300';
  const hoverTextColor = 'text-slate-900 dark:text-white';
  const textSizeClass = 'text-sm';

  return (
    <a href={href} className={`group relative inline-block overflow-hidden h-5 flex items-center ${textSizeClass}`}>
      <div className="flex flex-col transition-transform duration-400 ease-out transform group-hover:-translate-y-1/2">
        <span className={defaultTextColor}>{children}</span>
        <span className={hoverTextColor}>{children}</span>
      </div>
    </a>
  );
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState('rounded-full');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const shapeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // DARK MODE INITIALIZATION AND TOGGLE
  useEffect(() => {
    // Check if dark mode is already set on html element
    const isDarkAlready = document.documentElement.classList.contains('dark');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    let initialDarkMode = isDarkAlready;
    if (savedDarkMode !== null) {
      initialDarkMode = JSON.parse(savedDarkMode);
    }
    
    setIsDarkMode(initialDarkMode);
    
    // Apply to document
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('darkMode', JSON.stringify(initialDarkMode));
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      
      if (newMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
      
      return newMode;
    });
  };

  useEffect(() => {
    if (shapeTimeoutRef.current) {
      clearTimeout(shapeTimeoutRef.current);
    }

    if (isOpen) {
      setHeaderShapeClass('rounded-xl');
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass('rounded-full');
      }, 300);
    }

    return () => {
      if (shapeTimeoutRef.current) {
        clearTimeout(shapeTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const logoElement = (
    <div className="relative w-5 h-5 flex items-center justify-center">
    <span className="absolute w-1.5 h-1.5 rounded-full bg-slate-600 dark:bg-gray-200 top-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-slate-600 dark:bg-gray-200 left-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-slate-600 dark:bg-gray-200 right-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-slate-600 dark:bg-gray-200 bottom-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
 </div>
  );

  const navLinksData = [
    { label: 'Manifesto', href: '#1' },
    { label: 'Careers', href: '#2' },
    { label: 'Discover', href: '#3' },
  ];

  const loginButtonElement = (
    <button className="px-4 py-2 sm:px-3 text-xs sm:text-sm border border-slate-400 dark:border-[#333] bg-white/50 dark:bg-[rgba(31,31,31,0.62)] text-slate-700 dark:text-gray-300 rounded-full hover:border-slate-600 dark:hover:border-white/50 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 w-full sm:w-auto">
      LogIn
    </button>
  );

  const signupButtonElement = (
    <div className="relative group w-full sm:w-auto">
       <div className="absolute inset-0 -m-2 rounded-full
                     hidden sm:block
                     bg-gray-100 dark:bg-gray-800
                     opacity-40 filter blur-lg pointer-events-none
                     transition-all duration-300 ease-out
                     group-hover:opacity-60 group-hover:blur-xl group-hover:-m-3"></div>
       <button className="relative z-10 px-4 py-2 sm:px-3 text-xs sm:text-sm font-semibold text-white dark:text-black bg-gradient-to-br from-gray-900 dark:from-gray-100 to-gray-700 dark:to-gray-300 rounded-full hover:from-gray-950 dark:hover:from-gray-200 hover:to-gray-800 dark:hover:to-gray-400 transition-all duration-200 w-full sm:w-auto">
         Signup
       </button>
    </div>
  );

  return (
    <header className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-20
                       flex flex-col items-center
                       pl-6 pr-6 py-3 backdrop-blur-sm
                       ${headerShapeClass}
                       border border-slate-400 dark:border-[#333] 
                       bg-white/70 dark:bg-[#1f1f1f57]
                       w-[calc(100%-2rem)] sm:w-auto
                       transition-[border-radius] duration-0 ease-in-out`}>

      <div className="flex items-center justify-between w-full gap-x-6 sm:gap-x-8">
        <div className="flex items-center">
           {logoElement}
        </div>

        <nav className="hidden sm:flex items-center space-x-4 sm:space-x-6 text-sm">
          {navLinksData.map((link) => (
            <AnimatedNavLink key={link.href} href={link.href}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-2 sm:gap-3">
          {loginButtonElement}
          {signupButtonElement}
        </div>

        {/* DARK MODE TOGGLE BUTTON */}
        <button
          onClick={toggleDarkMode}
          className="flex items-center justify-center w-8 h-8 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white focus:outline-none transition-colors duration-200"
          aria-label="Toggle dark mode"
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        <button className="sm:hidden flex items-center justify-center w-8 h-8 text-slate-700 dark:text-gray-300 focus:outline-none" onClick={toggleMenu} aria-label={isOpen ? 'Close Menu' : 'Open Menu'}>
          {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          )}
        </button>
      </div>

      <div className={`sm:hidden flex flex-col items-center w-full transition-all ease-in-out duration-300 overflow-hidden
                       ${isOpen ? 'max-h-[1000px] opacity-100 pt-4' : 'max-h-0 opacity-0 pt-0 pointer-events-none'}`}>
        <nav className="flex flex-col items-center space-y-4 text-base w-full">
          {navLinksData.map((link) => (
            <a key={link.href} href={link.href} className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors w-full text-center">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col items-center space-y-4 mt-4 w-full">
          {loginButtonElement}
          {signupButtonElement}
          {/* DARK MODE TOGGLE FOR MOBILE */}
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-400 dark:border-[#333] bg-white/50 dark:bg-[rgba(31,31,31,0.62)] text-slate-700 dark:text-gray-300 rounded-full hover:border-slate-600 dark:hover:border-white/50 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4" />
                <span className="text-xs">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                <span className="text-xs">Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
