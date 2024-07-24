import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminUserProfile({ userId, setContent, adminName, adminId, setUsername, setUserId, setInUsers }) {

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  };

  const [questionsList, setQuestionsList] = useState([]);
  useEffect(() => {
    axios.get('http://localhost:8000/questions').then(res => setQuestionsList(res.data));
  }, []);

  const [usersList, setUsersList] = useState([]);
  useEffect(() => {
    axios.get('http://localhost:8000/users').then(res => setUsersList(res.data));
  }, []);

  const [commentsList, setCommentsList] = useState([]);
  useEffect(() => {
    axios.get('http://localhost:8000/comments').then(res => setCommentsList(res.data));
  }, []);

  const [answersList, setAnswersList] = useState([]);
  useEffect(() => {
    axios.get('http://localhost:8000/answers').then(res => setAnswersList(res.data));
  }, []);

  const formatDateUser = (user) => {
    const convertDate = new Date(user.join_date);
    const normalDate = convertDate.toLocaleString('en-US', options).replace(/,([^,]*)$/, ' at$1');
    const today = new Date();
    const currentDayTime = Math.floor((today.getTime() - convertDate.getTime()) / 1000);
    let timeAgo;

    if (currentDayTime < 60) {
      timeAgo = `${currentDayTime} seconds ago`;
    } else if (currentDayTime < 3600) {
      const minNum = Math.floor(currentDayTime / 60);
      timeAgo = minNum === 1 ? `${minNum} minute ago` : `${minNum} minutes ago`;
    } else if (currentDayTime < 86400) {
      const hourNum = Math.floor(currentDayTime / 3600);
      timeAgo = hourNum === 1 ? `${hourNum} hour ago` : `${hourNum} hours ago`;
    } else {
      timeAgo = today.getFullYear() === convertDate.getFullYear()
        ? normalDate.replace(`, ${today.getFullYear()}`, '')
        : normalDate;
    }

    return timeAgo;
  };

  const goToUserProfile = (usernameSet, id) => {
    setUsername(usernameSet);
    setInUsers(true);
    setUserId(id);
    setContent('UserProfile');
  };

  const deleteAnswer = async (id) => {
    try {
      const answer = answersList.find(answer => answer._id === id);
  
      if (answer) {
        const deletedAnswerComments = answer.comments;
        for (const element of deletedAnswerComments) {
          await deleteComment(element);
        }
      }
  
      await axios.delete(`http://localhost:8000/answers/delete/${id}`);
      console.log('deleted answer');
    } catch (error) {
      console.error('Error deleting answer:', error);
    }
  };

  const deleteComment = (id) => {
    axios.delete(`http://localhost:8000/comments/delete/${id}`)
      .then(response => {
        console.log('deleted comment');
      })
      .catch(error => {
        console.error(error);
      });
  };

  const deleteQuestion = (id) => {
    const deletedQuestionAnswers = questionsList.find(question => question._id === id).answers;
    deletedQuestionAnswers.forEach(element => deleteAnswer(element));

    const deletedQuestionComments = questionsList.find(question => question._id === id).comments;
    deletedQuestionComments.forEach(element => deleteComment(element));

    axios.delete(`http://localhost:8000/questions/delete/${id}`)
      .then(response => {
        console.log('deleted question');
        const updatedQuestions = questionsList.filter(question => question._id !== id);
        setQuestionsList(updatedQuestions);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const error = <p className="InvalidCheck" id="tryDeletingThyself"></p>;

  const deleteUser = async (id) => {
    console.log('Deleting user with ID:', id);
    const userName = usersList.find(user => user._id === id).username;
    const confirmed = window.confirm(`Delete the user ${userName}?`);

    if (confirmed) {
      try {

        const questionsToDelete = questionsList.filter(question => question.asked_by === id);
        for (const question of questionsToDelete) {
          await deleteQuestion(question._id);
        }

        const answersToDelete = answersList.filter(answer => answer.ans_By === id);
        for (const answer of answersToDelete) {
          await deleteAnswer(answer._id);
        }

        const commentsToDelete = commentsList.filter(comment => comment.ans_By === id);
        for (const comment of commentsToDelete) {
          await deleteComment(comment._id);
        }

        await axios.delete(`http://localhost:8000/users/delete/${id}`);

        const updatedUsers = usersList.filter(user => user._id !== id);
        setUsersList(updatedUsers);

        console.log('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const currentUser = usersList.find(user => user._id === adminId);

  const tableItems = usersList.map(user => (
    <tr key={user._id}>
      <td>
        <button
          className="customLinkStyle"
          onClick={() => goToUserProfile(user.username, user._id)}
        >
          {user.username}
        </button>
        <br />
        {user.admin}
      </td>
      <td>{user.email}</td>
      <td>{user.rep} reputation</td>
      <td>Joined {formatDateUser(user)}</td>
      <td>
        <button className="customButtonStyle" onClick={() => deleteUser(user._id)}>
          Delete User
        </button>
      </td>
    </tr>
  ));

  let repNum = 0;
  if (currentUser && currentUser._id === userId) {
    repNum = currentUser.rep || 0;
  }

  if (currentUser && answersList.length > 0) {
    return (
      <div className="main">
        <h1 className="profile-username">Admin Username: {adminName}</h1>
        <h2 className="profile-reputation">Reputation: {repNum}</h2>
        <h2 className="join-date">Joined {formatDateUser(currentUser)}</h2>
        <table className="customTableStyle">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Reputation</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>{tableItems}</tbody>
        </table>
        {error && <div>{error}</div>}
      </div>
    );
  } else {
    return <></>;
  }
}
