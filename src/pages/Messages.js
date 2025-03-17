import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const MessagesContainer = styled.div`
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

const MessageForm = styled.form`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
`;

const SubmitButton = styled.button`
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

const MessageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const MessageCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const MessageTitle = styled.h3`
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MessageContent = styled.div`
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  max-height: ${({ isExpanded }) => (isExpanded ? '500px' : '0')};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const MessageMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  font-size: 0.85rem;
  color: #999;
`;

const MessageCategory = styled.span`
  display: inline-block;
  padding: 4px 8px;
  background-color: #e8f0fe;
  color: #4a86e8;
  border-radius: 12px;
  font-size: 0.8rem;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #ff4444;
  cursor: pointer;
  font-size: 1.2rem;
  opacity: 0;
  transition: opacity 0.3s;

  ${MessageCard}:hover & {
    opacity: 1;
  }

  &:hover {
    color: #ff0000;
  }
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 1.1rem;
`;

const EmptyText = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 1.1rem;
`;

const categories = [
  { id: 'all', name: '전체' },
  { id: 'love', name: '사랑' },
  { id: 'memory', name: '추억' },
  { id: 'wish', name: '소망' },
  { id: 'gratitude', name: '감사' }
];

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    category: 'love'
  });

  useEffect(() => {
    loadMessages();
  }, [selectedCategory]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      let loadedMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (selectedCategory !== 'all') {
        loadedMessages = loadedMessages.filter(message => message.category === selectedCategory);
      }

      setMessages(loadedMessages);
    } catch (error) {
      console.error('메시지 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.title.trim() || !newMessage.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'messages'), {
        ...newMessage,
        date: new Date().toISOString()
      });

      setNewMessage({
        title: '',
        content: '',
        category: 'love'
      });

      loadMessages();
    } catch (error) {
      console.error('메시지 저장 오류:', error);
      alert('메시지 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('이 메시지를 삭제하시겠습니까?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'messages', messageId));
      loadMessages();
    } catch (error) {
      console.error('메시지 삭제 오류:', error);
      alert('메시지 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewMessage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMessageClick = (messageId) => {
    setExpandedMessage(expandedMessage === messageId ? null : messageId);
  };

  return (
    <MessagesContainer>
      <Header>
        <Title>우리의 메시지</Title>
        <FilterSection>
          <FilterContainer>
            <FilterButton
              active={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
            >
              전체
            </FilterButton>
            {categories.map(category => (
              <FilterButton
                key={category.id}
                active={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </FilterButton>
            ))}
          </FilterContainer>
        </FilterSection>
      </Header>

      <MessageForm onSubmit={handleSubmit}>
        <FormGroup>
          <Label>제목</Label>
          <Input
            type="text"
            name="title"
            value={newMessage.title}
            onChange={handleChange}
            placeholder="메시지 제목을 입력하세요"
          />
        </FormGroup>
        <FormGroup>
          <Label>카테고리</Label>
          <Input
            as="select"
            name="category"
            value={newMessage.category}
            onChange={handleChange}
          >
            {categories.filter(cat => cat.id !== 'all').map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Input>
        </FormGroup>
        <FormGroup>
          <Label>내용</Label>
          <TextArea
            name="content"
            value={newMessage.content}
            onChange={handleChange}
            placeholder="메시지 내용을 입력하세요"
          />
        </FormGroup>
        <SubmitButton type="submit" disabled={loading}>
          {loading ? '저장 중...' : '메시지 남기기'}
        </SubmitButton>
      </MessageForm>

      <MessageGrid>
        {loading ? (
          <LoadingText>로딩 중...</LoadingText>
        ) : messages.length === 0 ? (
          <EmptyText>메시지가 없습니다.</EmptyText>
        ) : (
          messages.map(message => (
            <MessageCard key={message.id} onClick={() => handleMessageClick(message.id)}>
              <MessageTitle>
                {message.title}
                <DeleteButton onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(message.id);
                }}>×</DeleteButton>
              </MessageTitle>
              <MessageContent isExpanded={expandedMessage === message.id}>
                {message.content}
              </MessageContent>
              <MessageMeta>
                <MessageCategory>
                  {categories.find(c => c.id === message.category)?.name}
                </MessageCategory>
                <span>{new Date(message.date).toLocaleDateString()}</span>
              </MessageMeta>
            </MessageCard>
          ))
        )}
      </MessageGrid>
    </MessagesContainer>
  );
};

export default Messages; 