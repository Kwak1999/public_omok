import './App.css'
import Navbar from "./components/Navbar.jsx";
import {useState, useEffect} from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home.jsx";
import RoomList from "./pages/RoomList.jsx";
import PublicRoom from "./pages/PublicRoom.jsx";
import GameHistory from "./pages/GameHistory.jsx";
import Replay from "./pages/Replay.jsx";
import { removeGuestId } from './utils/guestAuth';
import { deleteGameHistory } from './utils/gameHistory';
import { getGuestId } from './utils/guestAuth';

function App() {
    const [darkMode, setDarkMode] = useState(false)

    // 페이지 종료 시 게스트 ID 및 경기 기록 삭제
    useEffect(() => {
        const handleBeforeUnload = async () => {
            const guestId = getGuestId();
            if (guestId) {
                try {
                    await deleteGameHistory(guestId);
                } catch (error) {
                    console.error('경기 기록 삭제 오류:', error);
                }
            }
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
          <Route path="/history" element={<GameHistory />} />
          <Route path="/replay/:gameId" element={<Replay />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
