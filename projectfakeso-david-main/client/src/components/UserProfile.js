import React, { useState, useEffect } from "react";
import axios from "axios";

const UserProfile = ({ userId, username, setQuestionId, setContent, setTagId, setInUsers, admin, adminName, adminId, setUsername, setUserId }) => {
  const [questions, setQuestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [questionsRes, usersRes, tagsRes, answersRes] = await Promise.all([
        axios.get('http://localhost:8000/questions'),
        axios.get('http://localhost:8000/users'),
        axios.get('http://localhost:8000/tags'),
        axios.get('http://localhost:8000/answers')
      ]);

      setQuestions(questionsRes.data);
      setUsers(usersRes.data);
      setTags(tagsRes.data);
      setAnswers(answersRes.data);
    };

    fetchData();
  }, []);

  const formatDate = (date) => {
    const convertDate = new Date(date);
    let normalDate = convertDate.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).replace(/,([^,]*)$/, ' at$1');

    const today = new Date();
    const currentDayTime = Math.floor((today.getTime() - convertDate.getTime()) / 1000);
    let minNum = Math.floor(currentDayTime / 60);

    if (today.getFullYear() === convertDate.getFullYear()) {
      let hourNum = Math.floor(minNum / 60);

      if (currentDayTime < 60) {
        return (`${currentDayTime} seconds ago`);
      } else if (currentDayTime < 3600) {
        return (`${minNum} ${minNum < 2 ? 'minute' : 'minutes'} ago`);
      } else if (hourNum < 24) {
        return (`${hourNum} ${hourNum < 2 ? 'hour' : 'hours'} ago`);
      } else {
        normalDate = normalDate.replace(`, ${today.getFullYear()}`, '');
        return (`${normalDate}`);
      }
    } else {
      return (`${normalDate}`);
    }
  };

  const changeQuestion = (questionId) => {
    setQuestionId(questionId);
    setContent('ModifyQuestion');
  };

  const filterForTag = (id) => {
    setTagId(id);
    setInUsers(false);

    if (admin) {
      setUsername(adminName);
      setUserId(adminId);
    }

    setContent('Questions');
  };

  const deleteAnswer = async (id) => {
    const answer = answers.find(answer => answer._id === id);

    if (answer) {
      const deletedAnswerComments = answer.comments;
      await Promise.all(deletedAnswerComments.map(element => deleteComment(element)));
    }

    await axios.delete(`http://localhost:8000/answers/delete/${id}`);
  };

  const deleteComment = async (id) => {
    await axios.delete(`http://localhost:8000/comments/delete/${id}`);
  };

  const deleteQuestion = async (id) => {
    const question = questions.find(question => question._id === id);

    if (question) {
      const deletedQuestionAnswers = question.answers;
      const deletedQuestionComments = question.comments;

      await Promise.all(deletedQuestionAnswers.map(element => deleteAnswer(element)));
      await Promise.all(deletedQuestionComments.map(element => deleteComment(element)));
    }

    await axios.delete(`http://localhost:8000/questions/delete/${id}`);
    console.log('Successfully deleted question');

    const updatedQuestions = questions.filter(q => q._id !== id);
    setQuestions(updatedQuestions);
  };

  const currentUser = users.find(user => user._id === userId);
  const askedQuestions = questions.filter(question => question.asked_by === userId);

  let tableItems = askedQuestions.map(question => (
    <tr key={question._id}>
      <td>
        <span>
          {question.answers.length} answers<br />
          {question.views} views
        </span>
      </td>
      <td>
        <span>
          <button className="question-link" onClick={() => changeQuestion(question._id)}>
            {question.title}
          </button><br />
  
          {tags.filter(tag => question.tags.includes(tag._id)).map(tagButton => (
            <button key={tagButton._id} className='tag-button' onClick={() => filterForTag(tagButton._id)}>
              {tagButton.name}
            </button>
          ))}
        </span>
      </td>
      <td className="votes">{question.upVotes.length - question.downVotes.length} Votes</td>
      <td>
        <span>
          {username} asked {formatDate(question.ask_date_time)}
        </span>
      </td>
      <td>
        <button className="custom-button-style" onClick={() => deleteQuestion(question._id)}>
          Delete Question
        </button>
      </td>
    </tr>
  ));

  if (tableItems.length === 0) {
    tableItems = (
      <tr>
        <td colSpan="5">
          <p>No questions available.</p>
        </td>
      </tr>
    );
  }

  const repNum = users.length > 0 ? users.find(user => user._id === userId).rep : 0;

  if (currentUser && answers.length > 0) {
    return (
      <div className="main">
        <h1 className="profile-username">Username: {username}</h1>
        <h2 className="profile-reputation">Reputation: {repNum}</h2>
        <h2 className="join-date">Joined {formatDate(currentUser.join_date)}</h2>
        <h3 className="questions-asked">Questions Asked</h3>
        <table className="question-table" id="questionTable">
          <tbody>{tableItems}</tbody>
        </table>
      </div>
    );
  } else {
    return null;
  }
}

export default UserProfile;
