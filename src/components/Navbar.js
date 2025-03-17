import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

// 스타일 컴포넌트
const NavContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const NavContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: #4a86e8;
`;

const NavLinks = styled.ul`
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
    flex-direction: column;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background-color: white;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    padding: 10px 0;
  }
`;

const NavItem = styled.li`
  margin: 0 15px;
  
  @media (max-width: 768px) {
    margin: 10px 0;
  }
`;

const NavLink = styled(Link)`
  color: ${({ active }) => (active ? '#4a86e8' : '#333')};
  font-weight: ${({ active }) => (active ? '600' : '400')};
  transition: all 0.3s ease;
  
  &:hover {
    color: #4a86e8;
  }
`;

const LogoutButton = styled.button`
  background-color: transparent;
  color: #666;
  cursor: pointer;
  border: none;
  font-size: 0.9rem;
  
  &:hover {
    color: #e04141;
  }
`;

const MenuToggle = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
`;

const UserInfo = styled.div`
  margin-right: 10px;
`;

const UserEmail = styled.span`
  font-size: 0.9rem;
  color: #666;
`;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <NavContainer>
      <NavContent>
        <Logo>우리의 추억 저장소</Logo>
        
        <MenuToggle onClick={toggleMenu}>
          {isOpen ? '✕' : '☰'}
        </MenuToggle>
        
        <NavLinks isOpen={isOpen}>
          <NavItem>
            <NavLink to="/" active={location.pathname === '/' ? 1 : 0}>
              홈
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/gallery" active={location.pathname === '/gallery' ? 1 : 0}>
              갤러리
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/map" active={location.pathname === '/map' ? 1 : 0}>
              추억 지도
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/messages" active={location.pathname === '/messages' ? 1 : 0}>
              메시지
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/timeline" active={location.pathname === '/timeline' ? 1 : 0}>
              타임라인
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/settings" active={location.pathname === '/settings' ? 1 : 0}>
              설정
            </NavLink>
          </NavItem>
          <NavItem>
            <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
          </NavItem>
        </NavLinks>
        
        <UserSection>
          {currentUser && (
            <>
              <UserInfo>
                <UserEmail>{currentUser.email}</UserEmail>
              </UserInfo>
              <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
            </>
          )}
        </UserSection>
      </NavContent>
    </NavContainer>
  );
};

export default Navbar; 