import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

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

const MapSelector = styled.div`
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
`;

const MapButton = styled.button`
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

const EditMemoryForm = styled(AddMemoryForm)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  max-width: 500px;
  width: 90%;
  background-color: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

// 주소 검색 관련 스타일 컴포넌트 추가
const AddressSearchContainer = styled.div`
  margin-bottom: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const AddressInputGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: ${props => props.mb || '0px'};
`;

const AddressInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const SearchButton = styled.button`
  background-color: #4a86e8;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #3a76d8;
  }

  &:disabled {
    background-color: #a2c0f7;
    cursor: not-allowed;
  }
`;

const SearchResultsContainer = styled.div`
  position: absolute;
  width: calc(100% - 30px);
  max-height: 200px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 5px;
`;

const SearchResultItem = styled.div`
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f5f5f5;
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

// 네이버 지도 API 관련 상수 추가
const NAVER_GEOCODE_URL = 'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode';

const MemoryMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
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
  const [editingMemory, setEditingMemory] = useState(null);
  const [mapType, setMapType] = useState('naver'); // 'naver' or 'google'
  const [selectedMemory, setSelectedMemory] = useState(null);
  // 주소 검색 관련 상태 추가
  const [addressInput, setAddressInput] = useState('');
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

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
      window.naver.maps.Event.addListener(mapInstanceRef.current, 'click', handleNaverMapClick);
    };

    // 네이버 지도 API가 로드되었는지 확인
    if (window.naver && window.naver.maps) {
      initializeMap();
    } else {
      // API가 로드되지 않은 경우 로드 이벤트 대기
      window.addEventListener('load', initializeMap);
    }

    loadMemories();

    return () => {
      window.removeEventListener('load', initializeMap);
    };
  }, []);

  // 네이버 지도 클릭 이벤트 핸들러
  const handleNaverMapClick = (e) => {
    const position = e.coord;
    setNewMemory(prev => ({
      ...prev,
      location: {
        lat: position.lat(),
        lng: position.lng()
      }
    }));

    // 클릭한 위치에 임시 마커 표시
    const marker = new window.naver.maps.Marker({
      position: position,
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

    // 이전 임시 마커 제거
    if (markersRef.current.length > 0) {
      markersRef.current[0].setMap(null);
    }
    markersRef.current = [marker];
  };

  // 구글 지도 클릭 이벤트 핸들러
  const handleGoogleMapClick = (e) => {
    const newLocation = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    
    setNewMemory(prev => ({
      ...prev,
      location: newLocation
    }));
  };

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

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

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

      markersRef.current.push(marker);

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
      const docRef = await addDoc(collection(db, 'memories'), {
        ...newMemory,
        createdAt: new Date().toISOString()
      });
      
      alert('추억이 성공적으로 저장되었습니다!');
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
      let errorMessage = '추억 저장 중 오류가 발생했습니다.';
      
      switch (error.code) {
        case 'permission-denied':
          errorMessage = '저장 권한이 없습니다. 다시 로그인해주세요.';
          break;
        case 'unavailable':
          errorMessage = '서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
          break;
        default:
          errorMessage = `오류가 발생했습니다: ${error.message}`;
      }
      
      alert(errorMessage);
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

  // 주소 검색 함수 추가
  const searchAddress = async () => {
    if (!addressInput.trim()) {
      alert('검색할 주소를 입력해주세요.');
      return;
    }

    setAddressSearchLoading(true);
    setShowSearchResults(true);
    
    try {
      // 네이버 지도 API를 활용하여 주소 검색
      // 실제로는 네이버 서치 API를 사용해야 하지만, 여기서는 예시로 구글 Geocoding API를 대체 사용합니다.
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressInput)}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&language=ko`);
      
      if (!response.ok) {
        throw new Error('주소 검색 실패');
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // 구글 API 결과를 네이버 API 결과 형식으로 변환
        const transformedResults = data.results.map(result => ({
          roadAddress: result.formatted_address,
          jibunAddress: result.formatted_address,
          x: result.geometry.location.lng.toString(),
          y: result.geometry.location.lat.toString()
        }));
        setSearchResults(transformedResults);
      } else {
        setSearchResults([]);
        alert('검색 결과가 없습니다. 다른 주소를 입력해보세요.');
      }
    } catch (error) {
      console.error('주소 검색 오류:', error);
      alert('주소 검색 중 오류가 발생했습니다. 다시 시도해주세요.');
      setSearchResults([]);
    } finally {
      setAddressSearchLoading(false);
    }
  };

  // 검색 결과에서 주소 선택 시 호출되는 함수
  const selectAddress = (address) => {
    // 선택한 주소의 좌표 정보를 메모리 위치로 설정
    const lat = parseFloat(address.y);
    const lng = parseFloat(address.x);
    
    setNewMemory(prev => ({
      ...prev,
      location: { lat, lng }
    }));
    
    // 지도를 해당 위치로 이동
    if (mapInstanceRef.current) {
      const position = new window.naver.maps.LatLng(lat, lng);
      mapInstanceRef.current.setCenter(position);
      
      // 임시 마커 표시
      // 기존 임시 마커 제거
      if (markersRef.current.length > 0) {
        markersRef.current[0].setMap(null);
      }
      
      // 새 마커 생성
      const marker = new window.naver.maps.Marker({
        position: position,
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
      
      markersRef.current = [marker];
    }
    
    // 검색결과 창 닫기
    setShowSearchResults(false);
  };

  const handleMarkerClick = (memory) => {
    setSelectedMemory(memory);
    setEditingMemory(memory);
  };

  const handleUpdateMemory = async (e) => {
    e.preventDefault();
    if (!editingMemory.title.trim() || !editingMemory.description.trim()) {
      alert('제목과 설명을 모두 입력해주세요.');
      return;
    }

    try {
      const memoryRef = doc(db, 'memories', editingMemory.id);
      await updateDoc(memoryRef, {
        title: editingMemory.title,
        description: editingMemory.description,
        category: editingMemory.category,
        date: editingMemory.date
      });

      setEditingMemory(null);
      setSelectedMemory(null);
      loadMemories();
    } catch (error) {
      console.error('메모리 수정 오류:', error);
      alert('메모리 수정 중 오류가 발생했습니다.');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingMemory(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderNaverMap = () => (
    <MapWrapper ref={mapRef} />
  );

  const renderGoogleMap = () => (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '600px' }}
        center={{ lat: 37.5665, lng: 126.9780 }}
        zoom={11}
        onClick={handleGoogleMapClick}
      >
        {memories.map(memory => (
          <Marker
            key={memory.id}
            position={{ lat: memory.location.lat, lng: memory.location.lng }}
            onClick={() => handleMarkerClick(memory)}
          />
        ))}
        {newMemory.location && mapType === 'google' && (
          <Marker
            position={{ lat: newMemory.location.lat, lng: newMemory.location.lng }}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }}
          />
        )}
        {selectedMemory && (
          <InfoWindow
            position={{ lat: selectedMemory.location.lat, lng: selectedMemory.location.lng }}
            onCloseClick={() => setSelectedMemory(null)}
          >
            <div>
              <h3>{selectedMemory.title}</h3>
              <p>{selectedMemory.date}</p>
              <p>{selectedMemory.description}</p>
              <button 
                onClick={() => setEditingMemory(selectedMemory)}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#4a86e8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  marginTop: '5px',
                  cursor: 'pointer'
                }}
              >
                수정하기
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );

  return (
    <MapContainer>
      <MapHeader>
        <Title>추억 지도</Title>
        <MapSelector>
          <MapButton
            active={mapType === 'naver'}
            onClick={() => setMapType('naver')}
          >
            네이버 지도
          </MapButton>
          <MapButton
            active={mapType === 'google'}
            onClick={() => setMapType('google')}
          >
            구글 지도
          </MapButton>
        </MapSelector>
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

      {mapType === 'naver' ? renderNaverMap() : renderGoogleMap()}

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

        {/* 주소 검색 영역 추가 */}
        <AddressSearchContainer>
          <Label>위치 설정</Label>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
            지도를 클릭하여 위치를 선택하거나, 아래에 주소를 검색하세요.
          </p>
          <AddressInputGroup mb="10px">
            <AddressInput
              placeholder="주소 입력 (예: 서울특별시 강남구 테헤란로)"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
            />
            <SearchButton 
              type="button" 
              onClick={searchAddress}
              disabled={addressSearchLoading}
            >
              {addressSearchLoading ? '검색 중...' : '검색'}
            </SearchButton>
          </AddressInputGroup>
          
          {/* 검색 결과 표시 영역 */}
          {showSearchResults && searchResults.length > 0 && (
            <SearchResultsContainer>
              {searchResults.map((result, index) => (
                <SearchResultItem 
                  key={index} 
                  onClick={() => selectAddress(result)}
                >
                  {result.roadAddress || result.jibunAddress}
                </SearchResultItem>
              ))}
            </SearchResultsContainer>
          )}
          
          {/* 현재 선택된 위치 표시 */}
          {newMemory.location && (
            <div style={{ 
              fontSize: '14px', 
              color: '#333', 
              marginTop: '10px',
              padding: '8px',
              backgroundColor: '#e8f0fe',
              borderRadius: '4px'
            }}>
              <strong>선택된 위치:</strong> {newMemory.location.lat.toFixed(6)}, {newMemory.location.lng.toFixed(6)}
            </div>
          )}
        </AddressSearchContainer>

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

      {editingMemory && (
        <>
          <Overlay onClick={() => {
            setEditingMemory(null);
            setSelectedMemory(null);
          }} />
          <EditMemoryForm onSubmit={handleUpdateMemory}>
            <CloseButton onClick={() => {
              setEditingMemory(null);
              setSelectedMemory(null);
            }}>×</CloseButton>
            <FormTitle>메모리 수정</FormTitle>
            <InputGroup>
              <Label>제목</Label>
              <Input
                type="text"
                name="title"
                value={editingMemory.title}
                onChange={handleEditChange}
                placeholder="메모리 제목"
              />
            </InputGroup>
            <InputGroup>
              <Label>날짜</Label>
              <Input
                type="date"
                name="date"
                value={editingMemory.date}
                onChange={handleEditChange}
              />
            </InputGroup>
            <InputGroup>
              <Label>카테고리</Label>
              <Select
                name="category"
                value={editingMemory.category}
                onChange={handleEditChange}
              >
                {categories.slice(1).map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </InputGroup>
            <InputGroup>
              <Label>설명</Label>
              <Input
                as="textarea"
                name="description"
                value={editingMemory.description}
                onChange={handleEditChange}
                placeholder="메모리 설명"
              />
            </InputGroup>
            <Button type="submit">수정하기</Button>
          </EditMemoryForm>
        </>
      )}
    </MapContainer>
  );
};

export default MemoryMap; 