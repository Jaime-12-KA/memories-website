import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// 컴포넌트 불러오기
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// 페이지 불러오기
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import MemoryMap from './pages/MemoryMap';
import Messages from './pages/Messages';
import Timeline from './pages/Timeline';
import Settings from './pages/Settings';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase 인증 상태 변경 감지
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        {user && <Navbar />}
        <div className="content">
          <Routes>
            {/* 공개 경로 */}
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            
            {/* 보호된 경로 */}
            <Route path="/" element={<PrivateRoute user={user}><Dashboard /></PrivateRoute>} />
            <Route path="/gallery" element={<PrivateRoute user={user}><Gallery /></PrivateRoute>} />
            <Route path="/map" element={<PrivateRoute user={user}><MemoryMap /></PrivateRoute>} />
            <Route path="/messages" element={<PrivateRoute user={user}><Messages /></PrivateRoute>} />
            <Route path="/timeline" element={<PrivateRoute user={user}><Timeline /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute user={user}><Settings /></PrivateRoute>} />
            
            {/* 기본 리디렉션 */}
            <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 