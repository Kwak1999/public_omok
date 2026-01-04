import { useEffect, useState } from 'react';

const useDarkMode = (initialMode = false) => {
  const [darkMode, setDarkMode] = useState(initialMode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return { darkMode, toggleDarkMode };
};

export default useDarkMode;
