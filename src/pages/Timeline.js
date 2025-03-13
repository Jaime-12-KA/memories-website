import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const TimelineContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 10px;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  background-color: ${({ active }) => (active ? '#4a86e8' : 'white')};
  color: ${({ active }) => (active ? 'white' : '#333')};
  border: 1px solid #4a86e8;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${({ active }) => (active ? '#3a76d8' : '#f0f0f0')};
  }
`;

const TimelineWrapper = styled.div`
  position: relative;
  padding: 20px 0;

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 100%;
    background-color: #4a86e8;
    
    @media (max-width: 768px) {
      left: 30px;
    }
  }
`;

const TimelineItem = styled.div`
  display: flex;
  justify-content: ${({ position }) => position === 'left' ? 'flex-start' : 'flex-end'};
  padding: 20px 0;
  width: 100%;
  position: relative;

  @media (max-width: 768px) {
    justify-content: flex-start;
    padding-left: 60px;
  }
`;

const TimelineDot = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 16px;
  background-color: #4a86e8;
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  @media (max-width: 768px) {
    left: 30px;
  }
`;

const TimelineContent = styled.div`
  width: 45%;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 20px;
    ${({ position }) => position === 'left' 
      ? 'right: -10px; border-left: 10px solid white;' 
      : 'left: -10px; border-right: 10px solid white;'}
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
  }

  @media (max-width: 768px) {
    width: 100%;

    &::before {
      left: -10px;
      border-right: 10px solid white;
      border-left: none;
    }
  }
`;

const MemoryImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 5px;
  margin-bottom: 15px;
`;

const MemoryTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 10px;
`;

const MemoryDate = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 10px;
`;

const MemoryDescription = styled.p`
  font-size: 1rem;
  color: #555;
  line-height: 1.5;
`;

const CategoryTag = styled.span`
  display: inline-block;
  padding: 4px 8px;
  background-color: #e8f0fe;
  color: #4a86e8;
  border-radius: 15px;
  font-size: 0.8rem;
  margin-bottom: 10px;
`;

const LoadMoreButton = styled.button`
  display: block;
  width: 200px;
  margin: 30px auto;
  padding: 10px 20px;
  background-color: #4a86e8;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;

  &:hover {
    background-color: #3a76d8;
  }

  &:disabled {
    background-color: #a2c0f7;
    cursor: not-allowed;
  }
`;

const categories = [
  { id: 'all', name: '전체' },
  { id: 'date', name: '데이트' },
  { id: 'travel', name: '여행' },
  { id: 'food', name: '맛집' },
  { id: 'cafe', name: '카페' },
  { id: 'special', name: '특별한 날' }
];

const Timeline = () => {
  const [memories, setMemories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const memoriesPerPage = 10;

  useEffect(() => {
    loadMemories();
  }, [selectedCategory]);

  const loadMemories = async () => {
    setLoading(true);
    try {
      const memoriesRef = collection(db, 'memories');
      const q = query(memoriesRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      let loadedMemories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (selectedCategory !== 'all') {
        loadedMemories = loadedMemories.filter(memory => memory.category === selectedCategory);
      }

      setMemories(loadedMemories);
    } catch (error) {
      console.error('추억 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const displayedMemories = memories.slice(0, page * memoriesPerPage);
  const hasMore = memories.length > displayedMemories.length;

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  return (
    <TimelineContainer>
      <Header>
        <Title>우리의 타임라인</Title>
        <FilterContainer>
          {categories.map(category => (
            <FilterButton
              key={category.id}
              active={selectedCategory === category.id}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name}
            </FilterButton>
          ))}
        </FilterContainer>
      </Header>

      <TimelineWrapper>
        {displayedMemories.map((memory, index) => (
          <TimelineItem
            key={memory.id}
            position={index % 2 === 0 ? 'left' : 'right'}
          >
            <TimelineDot />
            <TimelineContent position={index % 2 === 0 ? 'left' : 'right'}>
              {memory.photoUrl && (
                <MemoryImage src={memory.photoUrl} alt={memory.title} />
              )}
              <CategoryTag>{getCategoryName(memory.category)}</CategoryTag>
              <MemoryTitle>{memory.title}</MemoryTitle>
              <MemoryDate>{new Date(memory.date).toLocaleDateString()}</MemoryDate>
              <MemoryDescription>{memory.description}</MemoryDescription>
            </TimelineContent>
          </TimelineItem>
        ))}
      </TimelineWrapper>

      {hasMore && (
        <LoadMoreButton
          onClick={() => setPage(prev => prev + 1)}
          disabled={loading}
        >
          {loading ? '로딩 중...' : '더 보기'}
        </LoadMoreButton>
      )}
    </TimelineContainer>
  );
};

export default Timeline; 