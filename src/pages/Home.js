import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
`;

const Hero = styled.div`
  padding: 60px 20px;
  background: linear-gradient(135deg, #4a86e8 0%, #3a76d8 100%);
  color: white;
  border-radius: 10px;
  margin-bottom: 40px;
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 20px;
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 30px;
`;

const Button = styled(Link)`
  display: inline-block;
  padding: 12px 30px;
  background-color: white;
  color: #4a86e8;
  text-decoration: none;
  border-radius: 25px;
  font-weight: 600;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 40px;
`;

const FeatureCard = styled.div`
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 10px;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

const Home = () => {
  return (
    <HomeContainer>
      <Hero>
        <HeroTitle>우리의 추억을 특별하게</HeroTitle>
        <HeroSubtitle>
          사진, 메시지, 지도로 우리의 소중한 순간들을 기록하고 공유하세요
        </HeroSubtitle>
        <Button to="/signup">시작하기</Button>
      </Hero>

      <Features>
        <FeatureCard>
          <FeatureTitle>갤러리</FeatureTitle>
          <FeatureDescription>
            사진을 업로드하고 카테고리별로 정리하여 우리의 특별한 순간들을 보관하세요.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureTitle>추억 지도</FeatureTitle>
          <FeatureDescription>
            함께 다닌 장소들을 지도에 표시하고 그곳에서의 추억을 기록하세요.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureTitle>타임라인</FeatureTitle>
          <FeatureDescription>
            시간 순서대로 우리의 추억들을 정리하고 특별한 순간들을 되돌아보세요.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureTitle>메시지</FeatureTitle>
          <FeatureDescription>
            서로에게 전하는 따뜻한 메시지를 남기고 소통하세요.
          </FeatureDescription>
        </FeatureCard>
      </Features>
    </HomeContainer>
  );
};

export default Home; 