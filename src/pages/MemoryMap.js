import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const MapContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const MapHeader = styled.div`
  margin-bottom: 20px;
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

const MapWrapper = styled.div`
  width: 100%;
  height: 600px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;

  @media (max-width: 768px) {
    height: 400px;
  }
`;

const AddMemoryForm = styled.form`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 15px;
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
`;

const Button = styled.button`
  background-color: #4a86e8;
  color: white;
  padding: 10px 20px;
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
  { id: 'restaurant', name: '맛집' },
  { id: 'cafe', name: '카페' },
  { id: 'movie', name: '영화관' },
  { id: 'date', name: '데이트' },
  { id: 'travel', name: '여행' },
  { id: 'special', name: '특별한 날' }
];

const MemoryMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [memories, setMemories] = useState([]);
  const [newMemory, setNewMemory] = useState({
    title: '',
    date: '',
    category: 'date',
    description: '',
    location: null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 네이버 지도 초기화
    const initializeMap = () => {
      if (!mapRef.current || !window.naver) return;

      const mapOptions = {
        center: new window.naver.maps.LatLng(37.5665, 126.9780), // 서울 시청
        zoom: 11,
        zoomControl: true,
        zoomControlOptions: {
          position: window.naver.maps.Position.TOP_RIGHT
        }
      };

      mapInstanceRef.current = new window.naver.maps.Map(mapRef.current, mapOptions);

      // 지도 클릭 이벤트 처리
      window.naver.maps.Event.addListener(mapInstanceRef.current, 'click', (e) => {
        setNewMemory(prev => ({
          ...prev,
          location: {
            lat: e.coord.lat(),
            lng: e.coord.lng()
          }
        }));
      });
    };

    initializeMap();
    loadMemories();
  }, []);

  // Firebase에서 추억 데이터 로드
  const loadMemories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'memories'));
      const loadedMemories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMemories(loadedMemories);
      displayMemories(loadedMemories);
    } catch (error) {
      console.error('추억 로드 오류:', error);
    }
  };

  // 지도에 마커 표시
  const displayMemories = (memoriesToShow) => {
    if (!mapInstanceRef.current) return;

    memoriesToShow.forEach(memory => {
      if (!memory.location) return;

      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(memory.location.lat, memory.location.lng),
        map: mapInstanceRef.current,
        icon: {
          content: `<div style="
            background-color: #4a86e8;
            border-radius: 50%;
            width: 12px;
            height: 12px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          "></div>`,
          anchor: new window.naver.maps.Point(6, 6)
        }
      });

      // 마커 클릭 시 정보창 표시
      const infoWindow = new window.naver.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 5px 0;">${memory.title}</h3>
            <p style="margin: 0 0 5px 0;">${memory.date}</p>
            <p style="margin: 0;">${memory.description}</p>
          </div>
        `
      });

      window.naver.maps.Event.addListener(marker, 'click', () => {
        if (infoWindow.getMap()) {
          infoWindow.close();
        } else {
          infoWindow.open(mapInstanceRef.current, marker);
        }
      });
    });
  };

  // 새로운 추억 저장
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMemory.location) {
      alert('지도를 클릭하여 위치를 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'memories'), newMemory);
      setNewMemory({
        title: '',
        date: '',
        category: 'date',
        description: '',
        location: null
      });
      loadMemories();
    } catch (error) {
      console.error('추억 저장 오류:', error);
      alert('추억을 저장하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 필터링
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const filteredMemories = category === 'all'
      ? memories
      : memories.filter(memory => memory.category === category);
    displayMemories(filteredMemories);
  };

  return (
    <MapContainer>
      <MapHeader>
        <Title>추억 지도</Title>
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
      </MapHeader>

      <MapWrapper ref={mapRef} />

      <AddMemoryForm onSubmit={handleSubmit}>
        <FormTitle>새로운 추억 기록하기</FormTitle>
        <InputGroup>
          <Label htmlFor="title">제목</Label>
          <Input
            id="title"
            value={newMemory.title}
            onChange={(e) => setNewMemory(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </InputGroup>

        <InputGroup>
          <Label htmlFor="date">날짜</Label>
          <Input
            id="date"
            type="date"
            value={newMemory.date}
            onChange={(e) => setNewMemory(prev => ({ ...prev, date: e.target.value }))}
            required
          />
        </InputGroup>

        <InputGroup>
          <Label htmlFor="category">카테고리</Label>
          <Select
            id="category"
            value={newMemory.category}
            onChange={(e) => setNewMemory(prev => ({ ...prev, category: e.target.value }))}
          >
            {categories.slice(1).map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </InputGroup>

        <InputGroup>
          <Label htmlFor="description">설명</Label>
          <Input
            id="description"
            as="textarea"
            value={newMemory.description}
            onChange={(e) => setNewMemory(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </InputGroup>

        <Button type="submit" disabled={loading}>
          {loading ? '저장 중...' : '추억 저장하기'}
        </Button>
      </AddMemoryForm>
    </MapContainer>
  );
};

export default MemoryMap; 