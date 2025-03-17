import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const SettingsContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const Section = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;

  &:focus {
    border-color: #4a86e8;
    outline: none;
  }
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

const Switch = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
`;

const SwitchInput = styled.input`
  display: none;
`;

const SwitchSlider = styled.span`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  background-color: #ccc;
  border-radius: 24px;
  margin-right: 10px;
  transition: background-color 0.3s;

  &:before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: white;
    top: 2px;
    left: 2px;
    transition: transform 0.3s;
  }

  ${SwitchInput}:checked + & {
    background-color: #4a86e8;
  }

  ${SwitchInput}:checked + &:before {
    transform: translateX(26px);
  }
`;

const SuccessMessage = styled.div`
  color: #28a745;
  margin-top: 10px;
  font-size: 0.9rem;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-top: 10px;
  font-size: 0.9rem;
`;

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    displayName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    darkMode: false
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setSettings(prev => ({
          ...prev,
          displayName: user.displayName || '',
          email: user.email || ''
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      // 프로필 이름 업데이트
      if (settings.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: settings.displayName
        });
      }

      // 이메일 업데이트
      if (settings.email !== user.email) {
        await updateEmail(user, settings.email);
      }

      // Firestore 사용자 문서 업데이트
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: settings.displayName,
        email: settings.email,
        updatedAt: new Date().toISOString()
      });

      setSuccess('프로필이 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      setError('프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    if (settings.newPassword !== settings.confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    try {
      await updatePassword(user, settings.newPassword);
      setSuccess('비밀번호가 성공적으로 변경되었습니다.');
      setSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('비밀번호 업데이트 오류:', error);
      setError('비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        emailNotifications: settings.emailNotifications,
        updatedAt: new Date().toISOString()
      });
      setSuccess('알림 설정이 업데이트되었습니다.');
    } catch (error) {
      console.error('알림 설정 업데이트 오류:', error);
      setError('알림 설정 업데이트 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        darkMode: settings.darkMode,
        updatedAt: new Date().toISOString()
      });
      setSuccess('테마 설정이 업데이트되었습니다.');
    } catch (error) {
      console.error('테마 설정 업데이트 오류:', error);
      setError('테마 설정 업데이트 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContainer>
      <Header>
        <Title>설정</Title>
        <Subtitle>계정 및 앱 설정을 관리하세요</Subtitle>
      </Header>

      <Section>
        <SectionTitle>프로필 설정</SectionTitle>
        <form onSubmit={handleProfileUpdate}>
          <FormGroup>
            <Label>이름</Label>
            <Input
              type="text"
              name="displayName"
              value={settings.displayName}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>이메일</Label>
            <Input
              type="email"
              name="email"
              value={settings.email}
              onChange={handleChange}
            />
          </FormGroup>
          <Button type="submit" disabled={loading}>
            {loading ? '저장 중...' : '프로필 업데이트'}
          </Button>
          {success && <SuccessMessage>{success}</SuccessMessage>}
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </form>
      </Section>

      <Section>
        <SectionTitle>비밀번호 변경</SectionTitle>
        <form onSubmit={handlePasswordUpdate}>
          <FormGroup>
            <Label>현재 비밀번호</Label>
            <Input
              type="password"
              name="currentPassword"
              value={settings.currentPassword}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>새 비밀번호</Label>
            <Input
              type="password"
              name="newPassword"
              value={settings.newPassword}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>새 비밀번호 확인</Label>
            <Input
              type="password"
              name="confirmPassword"
              value={settings.confirmPassword}
              onChange={handleChange}
            />
          </FormGroup>
          <Button type="submit" disabled={loading}>
            {loading ? '변경 중...' : '비밀번호 변경'}
          </Button>
          {success && <SuccessMessage>{success}</SuccessMessage>}
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </form>
      </Section>

      <Section>
        <SectionTitle>알림 설정</SectionTitle>
        <form onSubmit={handleNotificationUpdate}>
          <FormGroup>
            <Switch>
              <SwitchInput
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
              />
              <SwitchSlider />
              이메일 알림
            </Switch>
          </FormGroup>
          <Button type="submit" disabled={loading}>
            {loading ? '저장 중...' : '알림 설정 저장'}
          </Button>
          {success && <SuccessMessage>{success}</SuccessMessage>}
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </form>
      </Section>

      <Section>
        <SectionTitle>테마 설정</SectionTitle>
        <form onSubmit={handleThemeUpdate}>
          <FormGroup>
            <Switch>
              <SwitchInput
                type="checkbox"
                name="darkMode"
                checked={settings.darkMode}
                onChange={handleChange}
              />
              <SwitchSlider />
              다크 모드
            </Switch>
          </FormGroup>
          <Button type="submit" disabled={loading}>
            {loading ? '저장 중...' : '테마 설정 저장'}
          </Button>
          {success && <SuccessMessage>{success}</SuccessMessage>}
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </form>
      </Section>
    </SettingsContainer>
  );
};

export default Settings; 