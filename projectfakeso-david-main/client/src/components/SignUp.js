import axios from "axios";
import { useEffect, useState } from "react";
export default function SignUp({ setPage }) {

    let [usersList, setUsersList] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:8000/users').then(res => { setUsersList(res.data) });
    }, [])

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function containsEmailOrUser(username, email, password) {
        const emailBeforeAtSymbol = email.split('@')[0];
        return password.toLowerCase().includes(username.toLowerCase()) || 
        password.toLowerCase().includes(emailBeforeAtSymbol.toLowerCase());
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
          if (
            e.target.username.value === '' ||
            e.target.password.value === '' ||
            e.target.email.value === '' ||
            e.target.password.value !== e.target.retype.value
          ) {
            throw new Error('Invalid input');
          } else if (!isValidEmail(e.target.email.value)) {
            throw new Error('Please provide a correct email');
          } else if (
            containsEmailOrUser(
              e.target.username.value,
              e.target.email.value,
              e.target.password.value
            )
          ) {
            throw new Error('Please provide a stronger password');
          } else if (usersList.find((user) => user.email === e.target.email.value)) {
            throw new Error('There is already an account with the entered email');
          } else {
            await axios.post('http://localhost:8000/newUsers', {
              username: e.target.username.value,
              password: e.target.password.value,
              email: e.target.email.value,
            });
            setPage('Login');
          }
        } catch (error) {
          alert(error.message);
        }
      };

    return (
        <>
                <div className="Welcome">
                <div className="create-banner">Create a New Account</div>
                    <form onSubmit={handleSubmit}>
                        <p className="signup-title">Username*</p>
                        <input type="text" id="username" name="userNameResponse"className="input-field" /><br />
                        <p className="signup-title">Email*</p>
                        <input type="text" id="email" name="email" className="input-field" /><br />
                        <p className="signup-title">Password*</p>
                        <input type="password" id="password" name="password" className="input-field" /><br />
                        <p className="signup-title">Retype Password*</p>
                        <input type="password" id="retype" name="retype" className="input-field" /><br />

                        <p id="CheckingInvalidUser" className="InvalidCheck"></p>
                        <button type="submit" className="ask-signup-button">Sign Up</button>
                    </form>
                </div>

        </>

    );

}