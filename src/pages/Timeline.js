import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

// 이벤트 추가 폼 스타일
const AddEventForm = styled.form`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
`;

const SubmitButton = styled.button`
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

const ToggleFormButton = styled.button`
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
`;

const FileUploadContainer = styled.div`
  margin-bottom: 15px;
  position: relative;
`;

const FileInput = styled.input`
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

const FileUploadButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border: 1px dashed #ddd;
  border-radius: 5px;
  background-color: #f8f9fa;
  cursor: pointer;
  height: 100px;

  &:hover {
    background-color: #e9ecef;
  }
`;

const ImagePreview = styled.div`
  margin-top: 10px;
  img {
    width: 100%;
    max-height: 200px;
    object-fit: contain;
    border-radius: 5px;
  }
`;

const CompactAddEventForm = styled(AddEventForm)`
  max-width: 500px;
  margin: 20px auto 30px;
`;

const categories = [
  { id: 'all', name: '전체' },
  { id: 'date', name: '데이트' },
  { id: 'travel', name: '여행' },
  { id: 'food', name: '맛집' },
  { id: 'cafe', name: '카페' },
  { id: 'special', name: '특별한 날' },
  { id: 'event', name: '중요 이벤트' }
];

const Timeline = () => {
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    category: 'event',
    description: '',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const eventsPerPage = 10;

  useEffect(() => {
    loadEvents();
  }, [selectedCategory]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      // 'events' 컬렉션에서 데이터 로드
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      let loadedEvents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (selectedCategory !== 'all') {
        loadedEvents = loadedEvents.filter(event => event.category === selectedCategory);
      }

      setEvents(loadedEvents);
    } catch (error) {
      console.error('이벤트 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 이미지 파일 타입 검사
    if (!file.type.match('image.*')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    
    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기가 5MB를 초과할 수 없습니다.');
      return;
    }
    
    setImageFile(file);
    
    // 이미지 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // 이미지 업로드 함수
  const uploadImage = async (file) => {
    if (!file) return null;
    
    const storageRef = ref(storage, `timeline_images/${Date.now()}_${file.name}`);
    
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.date.trim() || !newEvent.description.trim()) {
      alert('제목, 날짜, 설명을 모두 입력해주세요.');
      return;
    }
    
    setSubmitting(true);
    try {
      let imageUrl = '';
      
      // 이미지가 있으면 업로드
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      
      // 새 이벤트를 'events' 컬렉션에 추가
      await addDoc(collection(db, 'events'), {
        ...newEvent,
        imageUrl,
        createdAt: new Date().toISOString()
      });
      
      alert('이벤트가 성공적으로 추가되었습니다!');
      
      // 폼 초기화
      setNewEvent({
        title: '',
        date: '',
        category: 'event',
        description: '',
        imageUrl: ''
      });
      setImageFile(null);
      setImagePreview(null);
      setShowForm(false);
      
      // 이벤트 목록 새로고침
      loadEvents();
    } catch (error) {
      console.error('이벤트 추가 오류:', error);
      alert('이벤트 추가 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayedEvents = events.slice(0, page * eventsPerPage);
  const hasMore = events.length > displayedEvents.length;

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const toggleForm = () => {
    setShowForm(!showForm);
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

      {/* 타임라인 표시 */}
      {loading ? (
        <p>로딩 중...</p>
      ) : events.length === 0 ? (
        <p>이벤트가 없습니다. 첫 번째 이벤트를 추가해보세요!</p>
      ) : (
        <TimelineWrapper>
          {displayedEvents.map((event, index) => (
            <TimelineItem 
              key={event.id} 
              position={index % 2 === 0 ? 'left' : 'right'}
            >
              <TimelineDot />
              <TimelineContent position={index % 2 === 0 ? 'left' : 'right'}>
                {event.imageUrl && (
                  <MemoryImage src={event.imageUrl} alt={event.title} />
                )}
                <CategoryTag>{getCategoryName(event.category)}</CategoryTag>
                <MemoryTitle>{event.title}</MemoryTitle>
                <MemoryDate>{event.date}</MemoryDate>
                <MemoryDescription>{event.description}</MemoryDescription>
              </TimelineContent>
            </TimelineItem>
          ))}
        </TimelineWrapper>
      )}

      {hasMore && (
        <LoadMoreButton 
          onClick={() => setPage(prev => prev + 1)}
          disabled={loading}
        >
          더 보기
        </LoadMoreButton>
      )}

      {/* 새 이벤트 추가 토글 버튼 */}
      <ToggleFormButton onClick={toggleForm}>
        {showForm ? '입력 양식 닫기' : '새 이벤트 추가하기'}
      </ToggleFormButton>

      {/* 새 이벤트 추가 폼 (토글) */}
      {showForm && (
        <CompactAddEventForm onSubmit={handleSubmit}>
          <FormTitle>새로운 이벤트 추가하기</FormTitle>
          <InputGroup>
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              name="title"
              value={newEvent.title}
              onChange={handleInputChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="date">날짜</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={newEvent.date}
              onChange={handleInputChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="category">카테고리</Label>
            <Select
              id="category"
              name="category"
              value={newEvent.category}
              onChange={handleInputChange}
            >
              {categories.slice(1).map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </InputGroup>

          <FileUploadContainer>
            <Label>이미지 업로드</Label>
            <FileUploadButton>
              <span>{imageFile ? imageFile.name : '이미지 파일을 선택하거나 끌어서 놓으세요'}</span>
              <FileInput
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
              />
            </FileUploadButton>
            {imagePreview && (
              <ImagePreview>
                <img src={imagePreview} alt="미리보기" />
              </ImagePreview>
            )}
          </FileUploadContainer>

          <InputGroup>
            <Label htmlFor="description">설명</Label>
            <TextArea
              id="description"
              name="description"
              value={newEvent.description}
              onChange={handleInputChange}
              required
            />
          </InputGroup>

          <SubmitButton type="submit" disabled={submitting}>
            {submitting ? '추가 중...' : '이벤트 추가하기'}
          </SubmitButton>
        </CompactAddEventForm>
      )}
    </TimelineContainer>
  );
};

export default Timeline; 