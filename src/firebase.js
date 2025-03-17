// Firebase 관련 설정
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase 구성 객체
const firebaseConfig = {
  apiKey: "AIzaSyBGGrbeibF1To6O3jmhs6N2IHnstroty38",
  authDomain: "memories-website-a089b.firebaseapp.com",
  projectId: "memories-website-a089b",
  storageBucket: "memories-website-a089b.firebasestorage.app",
  messagingSenderId: "709480777081",
  appId: "1:709480777081:web:14a50629563ca882a25ba8",
  measurementId: "G-0WKR00N26D"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Analytics 초기화
const analytics = getAnalytics(app);

// Firebase 서비스 내보내기
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { analytics };
export default app; 