import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

const GalleryContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin: 0;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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
  font-size: 0.9rem;

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
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
`;

const UploadArea = styled.div`
  border: 2px dashed #ddd;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  flex: 1;

  &:hover {
    border-color: #4a86e8;
    background-color: #f8f9fa;
  }
`;

const UploadText = styled.p`
  margin: 5px 0;
  color: #666;
  font-size: 0.9rem;
`;

const HiddenInput = styled.input`
  display: none;
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 5px;
  }
`;

const PhotoCard = styled.div`
  position: relative;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  aspect-ratio: 1;

  &:hover {
    transform: translateY(-3px);
  }
`;

const PhotoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PhotoInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  padding: 10px;
  color: white;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  max-height: 80%;
  overflow-y: auto;

  ${PhotoCard}:hover & {
    transform: translateY(0);
  }
`;

const PhotoTitle = styled.h3`
  font-size: 0.9rem;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PhotoDate = styled.p`
  font-size: 0.8rem;
  margin-bottom: 4px;
  opacity: 0.8;
`;

const PhotoDescription = styled.textarea`
  width: 100%;
  min-height: 40px;
  padding: 4px;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 4px;
  font-size: 0.8rem;
  background: rgba(0,0,0,0.5);
  color: white;
  resize: none;
  margin-bottom: 4px;

  &::placeholder {
    color: rgba(255,255,255,0.6);
  }
`;

const PhotoCategory = styled.span`
  display: inline-block;
  padding: 2px 6px;
  background-color: rgba(74, 134, 232, 0.8);
  color: white;
  border-radius: 10px;
  font-size: 0.7rem;
  margin-bottom: 4px;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: #ff4444;
  font-size: 1rem;
  z-index: 1;

  ${PhotoCard}:hover & {
    opacity: 1;
  }

  &:hover {
    background-color: #ff4444;
    color: white;
  }
`;

const SaveButton = styled.button`
  padding: 4px 8px;
  background-color: #4a86e8;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.7rem;
  transition: background-color 0.3s;
  width: 100%;

  &:hover {
    background-color: #3a76d8;
  }

  &:disabled {
    background-color: #a2c0f7;
    cursor: not-allowed;
  }
`;

const LoadMoreButton = styled.button`
  display: block;
  width: 200px;
  margin: 0 auto;
  padding: 10px 20px;
  background-color: #4a86e8;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;

  &:hover {
    background-color: #3a76d8;
  }

  &:disabled {
    background-color: #a2c0f7;
    cursor: not-allowed;
  }
`;

const UploadOptions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const CategorySelect = styled.select`
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background-color: white;
  cursor: pointer;
  font-size: 0.9rem;
`;

const UploadButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  background-color: #4a86e8;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 0.9rem;

  &:hover {
    background-color: #3a76d8;
  }

  &:disabled {
    background-color: #a2c0f7;
    cursor: not-allowed;
  }
`;

const ImagePopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const PopupImage = styled.img`
  max-width: 90%;
  max-height: 90vh;
  object-fit: contain;
`;

const PopupClose = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 10px;
  z-index: 1001;
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
  const [uploadCategory, setUploadCategory] = useState('date');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [editingDescription, setEditingDescription] = useState({});
  const photosPerPage = 12;
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadPhotos();
  }, [selectedCategory]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const photosRef = collection(db, 'photos');
      const q = query(photosRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      let loadedPhotos = [];
      
      for (const doc of querySnapshot.docs) {
        const photoData = doc.data();
        try {
          // Storage에서 이미지 존재 여부 확인
          const imageRef = ref(storage, photoData.url);
          await getDownloadURL(imageRef);
          
          // 이미지가 존재하면 목록에 추가
          loadedPhotos.push({
            id: doc.id,
            ...photoData
          });
        } catch (error) {
          // 이미지가 존재하지 않으면 Firestore 문서 삭제
          console.log('이미지가 존재하지 않아 문서를 삭제합니다:', doc.id);
          await deleteDoc(doc.ref);
        }
      }

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
          category: uploadCategory,
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

  // 사진 삭제 함수
  const handleDelete = async (photoId, photoUrl) => {
    if (!window.confirm('이 사진을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setLoading(true);
      
      // Storage에서 이미지 삭제
      const imageRef = ref(storage, photoUrl);
      await deleteObject(imageRef);

      // Firestore에서 문서 삭제
      await deleteDoc(doc(db, 'photos', photoId));

      // 상태 업데이트
      setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== photoId));
      
      alert('사진이 삭제되었습니다.');
    } catch (error) {
      console.error('사진 삭제 오류:', error);
      alert('사진 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDescriptionChange = (photoId, value) => {
    setEditingDescription(prev => ({
      ...prev,
      [photoId]: value
    }));
  };

  const handleSaveDescription = async (photoId) => {
    try {
      const photoRef = doc(db, 'photos', photoId);
      await updateDoc(photoRef, {
        description: editingDescription[photoId]
      });
      
      setPhotos(prevPhotos =>
        prevPhotos.map(photo =>
          photo.id === photoId
            ? { ...photo, description: editingDescription[photoId] }
            : photo
        )
      );
      
      setEditingDescription(prev => {
        const newState = { ...prev };
        delete newState[photoId];
        return newState;
      });
    } catch (error) {
      console.error('설명 저장 오류:', error);
      alert('설명 저장 중 오류가 발생했습니다.');
    }
  };

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
          <UploadText>클릭하여 사진 업로드</UploadText>
          <UploadText>또는</UploadText>
          <UploadText>사진을 여기에 드래그하세요</UploadText>
          <HiddenInput
            id="photo-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
          />
        </UploadArea>
        <UploadOptions>
          <CategorySelect
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
            disabled={loading}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </CategorySelect>
          <UploadButton
            as="label"
            htmlFor="photo-upload"
            disabled={loading}
          >
            {loading ? '업로드 중...' : '사진 업로드'}
          </UploadButton>
        </UploadOptions>
      </UploadSection>

      <PhotoGrid>
        {displayedPhotos.map(photo => (
          <PhotoCard 
            key={photo.id}
            onClick={() => setSelectedImage(photo)}
          >
            <PhotoImage src={photo.url} alt={photo.title} />
            <DeleteButton
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(photo.id, photo.url);
              }}
              disabled={loading}
            >
              ×
            </DeleteButton>
            <PhotoInfo>
              <PhotoCategory>{categories.find(c => c.id === photo.category)?.name}</PhotoCategory>
              <PhotoTitle>{photo.title}</PhotoTitle>
              <PhotoDate>{new Date(photo.date).toLocaleDateString()}</PhotoDate>
              <PhotoDescription
                value={editingDescription[photo.id] ?? photo.description}
                onChange={(e) => handleDescriptionChange(photo.id, e.target.value)}
                placeholder="사진에 대한 설명을 입력하세요..."
              />
              <SaveButton
                onClick={() => handleSaveDescription(photo.id)}
                disabled={!editingDescription[photo.id] || editingDescription[photo.id] === photo.description}
              >
                설명 저장
              </SaveButton>
            </PhotoInfo>
          </PhotoCard>
        ))}
      </PhotoGrid>

      {selectedImage && (
        <ImagePopup onClick={() => setSelectedImage(null)}>
          <PopupClose onClick={() => setSelectedImage(null)}>×</PopupClose>
          <PopupImage src={selectedImage.url} alt={selectedImage.title} />
        </ImagePopup>
      )}

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