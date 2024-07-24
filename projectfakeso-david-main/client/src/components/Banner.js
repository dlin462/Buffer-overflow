import { useState } from "react";
import axios from "axios";
export default function Banner({changeSearch, username, setUsername, setUserId, setPage, setContent, setInUsers, admin, setAdmin, setAdminName, setAdminId, adminName}) {

    const [inputValue, changeInputValue] = useState("");

    const searchSort = (e) => {
        e.preventDefault();
        changeInputValue(e.target.value);
        
    }
    const pressEnter = (e) => {
        if(e.key === "Enter"){
            changeSearch(e.target.value);
        }
    }

    const logout = () => {
        
          axios.post('http://localhost:8000/logout', {}, { withCredentials: true });
          setUserId('');
          setUsername('');
          setAdmin(false);
          setAdminId('');
          setAdminName('');
          setInUsers(false);
          setPage('Welcome');
        
      };

     
    const userProfile = () => {
        if(!admin){
            setInUsers(true)
            setContent('UserProfile');
        }else{
            setInUsers(false)
            setContent('AdminUserProfile');
        }
        
    }

    let nameDisplay = admin ? adminName : username ? username : "Guest";

    return (
        <>
            <div id="nameDisplay">
                <div id="admin">{nameDisplay}{admin}</div>
                {username && <button onClick={userProfile}>View Profile</button>}
                <button onClick={logout}>Logout</button>
            </div>
            <div id="header" className="header">
                <h1>Fake Stack Overflow</h1>
            </div>
    
            <div className="searchBar" >
                <input type="text" name="searchBar" id="Search" placeholder="Search..." onChange = {searchSort} onKeyUp = {pressEnter} value = {inputValue} ></input>
            </div>
            
            
        </>
        
    );
    
    }