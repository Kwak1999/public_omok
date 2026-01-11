import './App.css'
import Navbar from "./components/Navbar.jsx";
import {useState} from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home.jsx";
import RoomList from "./pages/RoomList.jsx";
import PublicRoom from "./pages/PublicRoom.jsx";

function App() {
    const [darkMode, setDarkMode] = useState(false)

  return (
    <Router>
      <div className={darkMode ? 'dark' : ''}>
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode}/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<RoomList />} />
          <Route path="/room/:roomId" element={<PublicRoom />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
