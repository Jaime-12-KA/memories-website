import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { AuthProvider } from './contexts/AuthContext';

// 컴포넌트 불러오기
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// 페이지 불러오기
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import MemoryMap from './pages/MemoryMap';
import Timeline from './pages/Timeline';
import Messages from './pages/Messages';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Settings from './pages/Settings';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContainer>
          <Navbar />
          <MainContent>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/gallery"
                element={
                  <PrivateRoute>
                    <Gallery />
                  </PrivateRoute>
                }
              />
              <Route
                path="/map"
                element={
                  <PrivateRoute>
                    <MemoryMap />
                  </PrivateRoute>
                }
              />
              <Route
                path="/timeline"
                element={
                  <PrivateRoute>
                    <Timeline />
                  </PrivateRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <PrivateRoute>
                    <Messages />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                }
              />
            </Routes>
          </MainContent>
        </AppContainer>
      </Router>
    </AuthProvider>
  );
}

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export default App; 