import React from 'react';
import Navbar from './Navbar.jsx';

const PageShell = ({ darkMode, onToggleTheme, children }) => (
  <div className={darkMode ? 'dark' : ''}>
    <div className="min-h-screen bg-slate-100 dark:bg-neutral-700">
      <Navbar darkMode={darkMode} onToggleTheme={onToggleTheme} />
      {children}
    </div>
  </div>
);

export default PageShell;
