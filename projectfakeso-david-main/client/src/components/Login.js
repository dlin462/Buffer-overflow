import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Login({
  setPage,
  setUserId,
  setUsername,
  setAdmin,
  setAdminName,
  setAdminId,
}) {
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/users');
        setUsersList(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    if (email === "" || password === "") {
      alert("Invalid Input");
      return;
    }

    const user = usersList.find((user) => user.email === email);

    if (!user) {
      alert("Incorrect Email or Password");
      return;
    }

    const storedHash = user.password;

    try {
      const response = await axios.post(
        'http://localhost:8000/login',
        { email, password, storedHash },
        { withCredentials: true }
      );

      const { _id, username, admin } = response.data;

      setUserId(_id);
      setUsername(username);
      setAdmin(admin);

      if (admin) {
        setAdminId(_id);
        setAdminName(username);
      }

      setPage('Content');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('Incorrect Password');
      } else {
        console.error('Login error:', error);
        alert('Error!');
      }
    }
  };

  return (
    <div className="Welcome">
      <div className="create-banner">Login to your account</div>
      <form onSubmit={handleSubmit}>
        <label className="login-label">
          Email*
          <input type="text" id="email" name="email" className="input-field" />
        </label>

        <label className="login-label">
          Password*
          <input
            type="password"
            id="password"
            name="password"
            className="input-field"
          />
        </label>

        <p id="CheckingInvalidLogin" className="InvalidCheck"></p>
        <button type="submit" className="ask-button-login">
          Login
        </button>
      </form>
    </div>
  );
}