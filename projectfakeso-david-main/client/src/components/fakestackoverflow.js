import React, { useEffect, useState } from 'react';
import Welcome from './Welcome';
import Login from './Login';
import SignUp from './SignUp';
import Content from './Content';
import axios from 'axios';

export default function FakeStackOverflow() {
  const [currentPage, setCurrentPage] = useState('Welcome');
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [admin, setAdmin] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminId, setAdminId] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/session', { withCredentials: true })
      .then(response => {
        if (response.data) {
          const userId = response.data.userId;
          const userName = response.data.username;
          const isAdmin = response.data.admin;

          setUserId(userId);
          setUsername(userName);

          if (isAdmin) {
            setAdminId(userId);
            setAdminName(userName);
            setAdmin(isAdmin);
          }

          setCurrentPage('Content');
        }
      })
      .catch(error => {
        console.error(error);
      });
  }, []); 

  const renderPage = () => {
    switch (currentPage) {
      case 'Welcome':
        return <Welcome setPage={setCurrentPage} />;

      case 'Login':
        return (
          <Login
            setPage={setCurrentPage}
            setUserId={setUserId}
            setUsername={setUsername}
            setAdmin={setAdmin}
            setAdminId={setAdminId}
            setAdminName={setAdminName}
          />
        );

      case 'SignUp':
        return <SignUp setPage={setCurrentPage} />;

      case 'Content':
        return (
          <Content
            setPage={setCurrentPage}
            setUserId={setUserId}
            setUsername={setUsername}
            userId={userId}
            username={username}
            admin={admin}
            adminId={adminId}
            adminName={adminName}
            setAdmin={setAdmin}
            setAdminId={setAdminId}
            setAdminName={setAdminName}
          />
        );

      default:
        console.error('Unexpected error:', currentPage);
        return null;
    }
  };

  return <>{renderPage()}</>;
}