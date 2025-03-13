import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

const GalleryContainer = styled.div`
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

const FilterSection = styled.div`
  margin-bottom: 20px;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
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

const UploadSection = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const UploadArea = styled.div`
  border: 2px dashed #ddd;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #4a86e8;
    background-color: #f8f9fa;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const PhotoCard = styled.div`
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const PhotoImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const PhotoInfo = styled.div`
  padding: 15px;
`;

const PhotoTitle = styled.h3`
  font-size: 1rem;
  color: #333;
  margin-bottom: 5px;
`;

const PhotoDate = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
`;

const PhotoDescription = styled.p`
  font-size: 0.9rem;
  color: #555;
`;

const LoadMoreButton = styled.button`
  display: block;
  width: 200px;
  margin: 0 auto;
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

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const photosPerPage = 12;

  useEffect(() => {
    loadPhotos();
  }, [selectedCategory]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const photosRef = collection(db, 'photos');
      const q = query(photosRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      let loadedPhotos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (selectedCategory !== 'all') {
        loadedPhotos = loadedPhotos.filter(photo => photo.category === selectedCategory);
      }

      setPhotos(loadedPhotos);
    } catch (error) {
      console.error('사진 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    setLoading(true);

    try {
      for (const file of files) {
        // 스토리지에 파일 업로드
        const storageRef = ref(storage, `photos/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        // Firestore에 사진 정보 저장
        await addDoc(collection(db, 'photos'), {
          url: downloadURL,
          title: file.name.split('.')[0],
          date: new Date().toISOString(),
          category: 'date',
          description: ''
        });
      }

      loadPhotos();
    } catch (error) {
      console.error('업로드 오류:', error);
      alert('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const displayedPhotos = photos.slice(0, page * photosPerPage);
  const hasMore = photos.length > displayedPhotos.length;

  return (
    <GalleryContainer>
      <Header>
        <Title>추억 갤러리</Title>
        <FilterSection>
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
        </FilterSection>
      </Header>

      <UploadSection>
        <UploadArea
          onClick={() => document.getElementById('photo-upload').click()}
        >
          <p>클릭하여 사진 업로드</p>
          <p>또는</p>
          <p>사진을 여기에 드래그하세요</p>
          <HiddenInput
            id="photo-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
          />
        </UploadArea>
      </UploadSection>

      <PhotoGrid>
        {displayedPhotos.map(photo => (
          <PhotoCard key={photo.id}>
            <PhotoImage src={photo.url} alt={photo.title} />
            <PhotoInfo>
              <PhotoTitle>{photo.title}</PhotoTitle>
              <PhotoDate>{new Date(photo.date).toLocaleDateString()}</PhotoDate>
              <PhotoDescription>{photo.description}</PhotoDescription>
            </PhotoInfo>
          </PhotoCard>
        ))}
      </PhotoGrid>

      {hasMore && (
        <LoadMoreButton
          onClick={() => setPage(prev => prev + 1)}
          disabled={loading}
        >
          {loading ? '로딩 중...' : '더 보기'}
        </LoadMoreButton>
      )}
    </GalleryContainer>
  );
};

export default Gallery; 