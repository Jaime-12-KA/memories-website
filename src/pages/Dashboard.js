import React from 'react';
import styled from 'styled-components';

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

const PhotoThumbnail = styled.div`
  background-color: #eee;
  border-radius: 5px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 0.8rem;
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

const Dashboard = () => {
  return (
    <DashboardContainer>
      <WelcomeSection>
        <Title>환영합니다!</Title>
        <WelcomeText>
          우리의 소중한 추억을 공유하고 저장하는 공간입니다.
          함께한 순간들을 기록하고 간직하세요.
        </WelcomeText>
      </WelcomeSection>
      
      <Subtitle>대시보드</Subtitle>
      
      <DashboardGrid>
        <DashboardCard>
          <CardTitle>최근 사진</CardTitle>
          <RecentPhotosGrid>
            <PhotoThumbnail>사진 1</PhotoThumbnail>
            <PhotoThumbnail>사진 2</PhotoThumbnail>
            <PhotoThumbnail>사진 3</PhotoThumbnail>
            <PhotoThumbnail>사진 4</PhotoThumbnail>
          </RecentPhotosGrid>
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
          <ActivityItem>
            <ActivityDot />
            <ActivityContent>
              <ActivityTitle>새로운 사진 5장이 추가되었습니다.</ActivityTitle>
              <ActivityTime>3시간 전</ActivityTime>
            </ActivityContent>
          </ActivityItem>
          <ActivityItem>
            <ActivityDot />
            <ActivityContent>
              <ActivityTitle>홍대 카페에 새로운 추억이 기록되었습니다.</ActivityTitle>
              <ActivityTime>어제</ActivityTime>
            </ActivityContent>
          </ActivityItem>
          <ActivityItem>
            <ActivityDot />
            <ActivityContent>
              <ActivityTitle>'한강 데이트' 메시지에 댓글이 추가되었습니다.</ActivityTitle>
              <ActivityTime>2일 전</ActivityTime>
            </ActivityContent>
          </ActivityItem>
        </DashboardCard>
      </DashboardGrid>
    </DashboardContainer>
  );
};

export default Dashboard; 