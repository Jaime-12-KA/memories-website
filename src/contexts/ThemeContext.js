import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

// 테마 정의
export const themes = {
  light: {
    background: '#f5f5f7',
    surface: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    primary: '#4a86e8',
    primaryDark: '#3a76d8',
    border: '#dddddd',
    shadowLight: 'rgba(0, 0, 0, 0.1)',
    shadowMedium: 'rgba(0, 0, 0, 0.15)'
  },
  dark: {
    background: '#121212',
    surface: '#1e1e1e',
    text: '#e0e0e0',
    textSecondary: '#a0a0a0',
    primary: '#5c92f5',
    primaryDark: '#4a86e8',
    border: '#333333',
    shadowLight: 'rgba(0, 0, 0, 0.5)',
    shadowMedium: 'rgba(0, 0, 0, 0.7)'
  }
};

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // 사용자 설정 로드
  useEffect(() => {
    async function loadUserSettings() {
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData.darkMode !== undefined) {
              setDarkMode(userData.darkMode);
            }
          }
        } catch (error) {
          console.error('사용자 설정 로드 오류:', error);
        }
      }
      setLoading(false);
    }

    loadUserSettings();
  }, [currentUser]);

  // 다크모드 토글 함수
  const toggleDarkMode = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          darkMode: newDarkMode,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('테마 설정 업데이트 오류:', error);
      }
    }
  };

  // 현재 테마 객체
  const theme = darkMode ? themes.dark : themes.light;

  const value = {
    darkMode,
    toggleDarkMode,
    theme
  };

  return (
    <ThemeContext.Provider value={value}>
      {!loading && children}
    </ThemeContext.Provider>
  );
} 