import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// 스타일 컴포넌트
const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const WelcomeSection = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: #333;
`;

const Subtitle = styled.h2`
  font-size: 1.4rem;
  margin: 30px 0 15px;
  color: #333;
`;

const WelcomeText = styled.p`
  font-size: 1rem;
  color: #555;
  line-height: 1.6;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DashboardCard = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #4a86e8;
  display: flex;
  align-items: center;
`;

const RecentPhotosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
`;

const PhotoThumbnail = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const AnniversaryItem = styled.div`
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const AnniversaryDate = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 3px;
`;

const AnniversaryTitle = styled.div`
  font-size: 1rem;
  font-weight: 500;
`;

const ActivityItem = styled.div`
  display: flex;
  margin-bottom: 15px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ActivityDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #4a86e8;
  margin-top: 5px;
  margin-right: 10px;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 3px;
`;

const ActivityTime = styled.div`
  font-size: 0.8rem;
  color: #888;
`;

const LoadingText = styled.div`
  text-align: center;
  color: #888;
`;

const EmptyText = styled.div`
  text-align: center;
  color: #888;
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
`;

const Dashboard = () => {
  const [recentPhotos, setRecentPhotos] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentPhotos();
    loadRecentActivities();
  }, []);

  const loadRecentPhotos = async () => {
    try {
      const photosRef = collection(db, 'photos');
      const q = query(photosRef, orderBy('date', 'desc'), limit(4));
      const querySnapshot = await getDocs(q);
      
      const photos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setRecentPhotos(photos);
    } catch (error) {
      console.error('최근 사진 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivities = async () => {
    try {
      // 최근 사진 업로드 활동
      const photosRef = collection(db, 'photos');
      const photosQuery = query(photosRef, orderBy('date', 'desc'), limit(5));
      const photosSnapshot = await getDocs(photosQuery);
      
      // 최근 메시지 활동
      const messagesRef = collection(db, 'messages');
      const messagesQuery = query(messagesRef, orderBy('date', 'desc'), limit(5));
      const messagesSnapshot = await getDocs(messagesQuery);
      
      // 최근 지도 메모리 활동
      const memoriesRef = collection(db, 'memories');
      const memoriesQuery = query(memoriesRef, orderBy('date', 'desc'), limit(5));
      const memoriesSnapshot = await getDocs(memoriesQuery);

      const activities = [
        ...photosSnapshot.docs.map(doc => ({
          type: 'photo',
          title: '새로운 사진이 업로드되었습니다',
          date: doc.data().date,
          data: doc.data()
        })),
        ...messagesSnapshot.docs.map(doc => ({
          type: 'message',
          title: '새로운 메시지가 도착했습니다',
          date: doc.data().date,
          data: doc.data()
        })),
        ...memoriesSnapshot.docs.map(doc => ({
          type: 'memory',
          title: '새로운 추억이 기록되었습니다',
          date: doc.data().date,
          data: doc.data()
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date))
       .slice(0, 5);

      setRecentActivities(activities);
    } catch (error) {
      console.error('활동 로드 오류:', error);
    }
  };

  return (
    <DashboardContainer>
      <WelcomeSection>
        <Title>우리의 추억</Title>
        <Subtitle>함께 만드는 특별한 순간들</Subtitle>
      </WelcomeSection>
      
      <Subtitle>대시보드</Subtitle>
      
      <DashboardGrid>
        <DashboardCard>
          <CardTitle>최근 사진</CardTitle>
          <PhotoGrid>
            {loading ? (
              <LoadingText>로딩 중...</LoadingText>
            ) : recentPhotos.length > 0 ? (
              recentPhotos.map(photo => (
                <PhotoThumbnail key={photo.id} src={photo.url} alt={photo.title} />
              ))
            ) : (
              <EmptyText>아직 업로드된 사진이 없습니다.</EmptyText>
            )}
          </PhotoGrid>
        </DashboardCard>
        
        <DashboardCard>
          <CardTitle>다가오는 기념일</CardTitle>
          <AnniversaryItem>
            <AnniversaryDate>2023년 12월 25일 (D-7)</AnniversaryDate>
            <AnniversaryTitle>크리스마스</AnniversaryTitle>
          </AnniversaryItem>
          <AnniversaryItem>
            <AnniversaryDate>2024년 1월 1일 (D-14)</AnniversaryDate>
            <AnniversaryTitle>새해</AnniversaryTitle>
          </AnniversaryItem>
          <AnniversaryItem>
            <AnniversaryDate>2024년 1월 15일 (D-28)</AnniversaryDate>
            <AnniversaryTitle>우리의 기념일</AnniversaryTitle>
          </AnniversaryItem>
        </DashboardCard>
        
        <DashboardCard>
          <CardTitle>최근 활동</CardTitle>
          {loading ? (
            <LoadingText>로딩 중...</LoadingText>
          ) : recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <ActivityItem key={index}>
                <ActivityDot />
                <ActivityContent>
                  <ActivityTitle>{activity.title}</ActivityTitle>
                  <ActivityTime>
                    {new Date(activity.date).toLocaleDateString()}
                  </ActivityTime>
                </ActivityContent>
              </ActivityItem>
            ))
          ) : (
            <EmptyText>아직 활동 내역이 없습니다.</EmptyText>
          )}
        </DashboardCard>
      </DashboardGrid>
    </DashboardContainer>
  );
};

export default Dashboard; 