import './App.css';
import PageShell from '@ui/layout/PageShell.jsx';
import Home from '@ui/pages/Home.jsx';
import useDarkMode from '@shared/hooks/useDarkMode.js';

function App() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <PageShell darkMode={darkMode} onToggleTheme={toggleDarkMode}>
      <Home />
    </PageShell>
  );
}

export default App;
