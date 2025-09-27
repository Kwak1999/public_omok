import './App.css'
import Navbar from "./components/Navbar.jsx";
import {useState} from "react";
import Board from "./components/Board.jsx";
import Home from "./components/Home.jsx";

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
