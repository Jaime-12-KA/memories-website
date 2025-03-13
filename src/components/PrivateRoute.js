import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// 인증된 사용자만 접근할 수 있는 컴포넌트를 감싸는 PrivateRoute 컴포넌트
const PrivateRoute = ({ user, children }) => {
  if (!user) {
    // 사용자가 인증되지 않은 경우 로그인 페이지로 리디렉션
    return <Navigate to="/login" />;
  }

  // 사용자가 인증된 경우 자식 컴포넌트 렌더링
  return children;
};

PrivateRoute.propTypes = {
  user: PropTypes.object,
  children: PropTypes.node.isRequired
};

export default PrivateRoute; 