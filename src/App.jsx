import './App.css'
import Navbar from "./components/Navbar.jsx";
import {useState, useEffect} from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home.jsx";
import RoomList from "./pages/RoomList.jsx";
import PublicRoom from "./pages/PublicRoom.jsx";
import { removeGuestId } from './utils/guestAuth';

function App() {
    const [darkMode, setDarkMode] = useState(false)

    // 페이지 종료 시 게스트 ID 삭제
    useEffect(() => {
        const handleBeforeUnload = () => {
            removeGuestId();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

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
