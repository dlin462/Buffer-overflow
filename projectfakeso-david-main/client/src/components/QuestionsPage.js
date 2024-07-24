import axios from 'axios';
import { useEffect, useState } from 'react';

export default function CustomQuestionsPage({ searchInput, displayContent, findAnswerById, specificTag, resetTag, username }) {
  const dateFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };

  const formatDate = (question) => {
    const convertDate = new Date(question.ask_date_time);
    let normalDate = convertDate.toLocaleString('en-US', dateFormatOptions).replace(/,([^,]*)$/, ' at$1');
    const today = new Date();
    const currentDayTime = Math.floor((today.getTime() - convertDate.getTime()) / 1000);
    const minNum = Math.floor(currentDayTime / 60);

    if (today.getFullYear() === convertDate.getFullYear()) {
      const hourNum = Math.floor(minNum / 60);

      if (currentDayTime < 60) return `${currentDayTime} seconds ago`;
      if (currentDayTime < 3600) return minNum < 2 ? `${minNum} minute ago` : `${minNum} minutes ago`;
      if (hourNum < 24) return hourNum < 2 ? `${hourNum} hour ago` : `${hourNum} hours ago`;

      normalDate = normalDate.replace(`, ${today.getFullYear()}`, '');
      return `${normalDate}`;
    } else {
      return `${normalDate}`;
    }
  };

  const [questionsList, setQuestions] = useState([]);
  const [questionCounter, setQuestionCounter] = useState(0);
  const [questionsFilter, setQuestionsFilter] = useState([]);
  const [tagsButtonList, setTags] = useState([]);
  const [answersList, setAnswersList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    axios.get('http://localhost:8000/questions').then((res) => {
      const sorted = res.data.sort((a, b) => Date.parse(b.ask_date_time) - Date.parse(a.ask_date_time));
      setQuestions(sorted);
      
      setQuestionsFilter(sorted.slice(0, itemsPerPage));
      setQuestionCounter(sorted.length);
      setTotalPages(Math.ceil(sorted.length / itemsPerPage));
    });
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8000/tags').then((res) => setTags(res.data));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8000/answers').then((res) => setAnswersList(res.data));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8000/users').then((res) => setUsersList(res.data));
  }, []);

  const displayAnswerPage = (id) => {
    const updatedViews = questionsList.find((question) => question._id === id).views + 1;
    axios.put(`http://localhost:8000/questions/${id}`, { views: updatedViews });
    findAnswerById(id);
    displayContent('Answers');
  };

  const filterForTag = (id) => {
    resetTag(id);
  };

  const [activeFilter, setActiveFilter] = useState('all');

  const handleNextPage = () => {
    if (currentPage === totalPages) return;
    const startIndex = (currentPage * itemsPerPage);
    const endIndex = startIndex + itemsPerPage;
    setQuestionsFilter(getFilteredQuestions().slice(startIndex, endIndex));
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage === 1) return;
    const startIndex = (currentPage - 2) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setQuestionsFilter(getFilteredQuestions().slice(startIndex, endIndex));
    setCurrentPage(currentPage - 1);
  };

  const sortNewest = () => {
    setActiveFilter('newest');
    const sortedQuestions = [...questionsList].sort((a, b) => Date.parse(b.ask_date_time) - Date.parse(a.ask_date_time));
    setQuestionsFilter(sortedQuestions.slice(0, itemsPerPage));
    setQuestionCounter(sortedQuestions.length);
    setTotalPages(Math.ceil(sortedQuestions.length / itemsPerPage));
    setCurrentPage(1);
  };

  const sortActive = () => {
    setActiveFilter('active');
    const sortedQuestions = [...questionsList].sort((a, b) => {
      const latestAnswerA = answersList.find((answer) => answer._id === a.answers[a.answers.length - 1]);
      const latestAnswerB = answersList.find((answer) => answer._id === b.answers[b.answers.length - 1]);
      const dateA = latestAnswerA ? Date.parse(latestAnswerA.ans_date_time) : undefined;
      const dateB = latestAnswerB ? Date.parse(latestAnswerB.ans_date_time) : undefined;

      if (dateA === undefined && dateB === undefined) return 0;
      if (dateA === undefined) return 1;
      if (dateB === undefined) return -1;

      return dateA - dateB;
    });

    setQuestionsFilter(sortedQuestions.slice(0, itemsPerPage));
    setQuestionCounter(sortedQuestions.length);
    setTotalPages(Math.ceil(sortedQuestions.length / itemsPerPage));
    setCurrentPage(1);
  };

  const sortUnanswered = () => {
    setActiveFilter('unanswered');
    const unansweredQuestions = questionsList.filter((question) => question.answers.length === 0);
    setQuestionsFilter(unansweredQuestions.slice(0, itemsPerPage));
    setQuestionCounter(unansweredQuestions.length);
    setTotalPages(Math.ceil(unansweredQuestions.length / itemsPerPage));
    setCurrentPage(1);
  };

  const getFilteredQuestions = () => {
    switch (activeFilter) {
      case 'newest':
        return [...questionsList].sort((a, b) => Date.parse(b.ask_date_time) - Date.parse(a.ask_date_time));
      case 'active':
        return [...questionsList].sort((a, b) => {
          const latestAnswerA = answersList.find((answer) => answer._id === a.answers[a.answers.length - 1]);
          const latestAnswerB = answersList.find((answer) => answer._id === b.answers[b.answers.length - 1]);
          const dateA = latestAnswerA ? Date.parse(latestAnswerA.ans_date_time) : undefined;
          const dateB = latestAnswerB ? Date.parse(latestAnswerB.ans_date_time) : undefined;

          if (dateA === undefined && dateB === undefined) return 0;
          if (dateA === undefined) return 1;
          if (dateB === undefined) return -1;

          return dateA - dateB;
        });
      case 'unanswered':
        return questionsList.filter((question) => question.answers.length === 0);
      default:
        return questionsList;
    }
  };

  useEffect(() => {
    if (searchInput.includes('[') && searchInput.includes(']')) {
      const tagSearchArray = searchInput.match(/\[(.*?)\]/g).map((tagOnly) => tagOnly.slice(1, -1));
      const regSearchArray = searchInput.trim().split(/\[.*?\]/).filter(Boolean).map((makeL) => makeL.toLowerCase());
      const tagIdList = tagsButtonList.filter((findTag) => tagSearchArray.includes(findTag.name)).map((tag) => tag._id);
      const searchQuestions = questionsList.filter(
        (question) =>
          question.tags.some((tagItem) => tagIdList.includes(tagItem)) ||
          regSearchArray.some((regItem) => question.title.toLowerCase().includes(regItem.toLowerCase()))
      );
      setQuestionsFilter(searchQuestions);
    } else if (searchInput !== '') {
      const searchQuestions = questionsList.filter((question) => question.title.toLowerCase().includes(searchInput.toLowerCase().trim()));
      setQuestionsFilter(searchQuestions);
    } else {
      setQuestionsFilter(questionsList);
    }
  }, [searchInput, questionsList, tagsButtonList]);

  const specificTagName = tagsButtonList.find((tag) => tag._id === specificTag);

  useEffect(() => {
    if (specificTag !== '' && specificTagName) {
      document.getElementById('allQuestions').innerHTML = `Questions with Tag: ${specificTagName.name}`;
      setQuestionsFilter(questionsList.filter((question) => question.tags.includes(specificTag)));
    } else {
      document.getElementById('allQuestions').innerHTML = 'All Questions';
      setQuestionsFilter(questionsList);
    }
  }, [specificTag, questionsList, specificTagName]);

  const displayAskQPage = () => {
    displayContent('AskQuestion');
  };

  let tableItems;
if (usersList.length > 0) {
  tableItems = questionsFilter.map((question, index) => (
    <tr key={index}>
      <td>
        {question.answers.length} answers<br />
        {question.views} views
      </td>
      <td>
        <button
          className="question-title"
          onClick={() => displayAnswerPage(question._id)}
          style={{ fontSize: '18px', fontWeight: 'bold' }}
        >
          {question.title}
        </button>
        <br />
        {tagsButtonList
          .filter((tag) => question.tags.includes(tag._id))
          .map((tagButton) => (
            <button key={tagButton._id} className="tagButton" onClick={() => filterForTag(tagButton._id)}>
              {tagButton.name}
            </button>
          ))}
        
        <div className="question-summary">
          <p>{question.sum}</p>
        </div>
      </td>
      <td className="votes">{question.upVotes.length - question.downVotes.length} Votes</td>
      <td className="colored-askedBy">
        {usersList.find((user) => user._id === question.asked_by).username} asked {formatDate(question)}
      </td>
    </tr>
  ));
}

  return (
    <>
      <div className="main">
        <div className="header">
          <h1 id="allQuestions">All Questions</h1>
          {username && <button className="ask-button" onClick={displayAskQPage}>Ask Question</button>}
        </div>
        <p id="questionCounter">{questionCounter} questions</p>
        <div className="button-mid-container">
          <div>
            <button id="newest-button" value="Newest" onClick={sortNewest}>
              Newest
            </button>
            <button id="active-button" value="Active" onClick={sortActive}>
              Active
            </button>
            <button id="unanswered-button" value="Unanswered" onClick={sortUnanswered}>
              Unanswered
            </button>
          </div>
        </div>

        <div id="questionList">
          <table id="questionTable">
            <tbody>{tableItems}</tbody>
          </table>
          <button id="prev" value="Prev" onClick={handlePrevPage} disabled={currentPage === 1}>
            Prev
          </button>
          <button id="next" value="Next" onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      </div>
    </>
  );

}