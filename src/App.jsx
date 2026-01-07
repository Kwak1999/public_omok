import './App.css'
import Navbar from "./components/Navbar.jsx";
import {useState} from "react";
import Home from "./pages/Home.jsx";

function App() {
    const [darkMode, setDarkMode] = useState(false)

  return (
    <div className={darkMode ? 'dark' : ''}>
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode}/>
        <Home />
    </div>
  )
}

export default App
