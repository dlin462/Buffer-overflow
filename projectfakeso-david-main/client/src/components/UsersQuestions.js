import axios from 'axios';
import { useEffect, useState } from 'react';
export default function UsersQuestions({displayContent, resetTag, username, userId, setInUsers, selectQuestion, admin, adminName, adminId, setUsername, setUserId}) {

    
      const formatDate = (question) => {
        const convertDate = new Date(question.ask_date_time);
        const options = {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        };
        const normalDate = convertDate.toLocaleString('en-US', options).replace(/,([^,]*)$/, ' at$1');
        const today = new Date();
        const currentDayTime = Math.floor((today.getTime() - convertDate.getTime()) / 1000);
        const minNum = Math.floor(currentDayTime / 60);
      
        if (today.getFullYear() === convertDate.getFullYear()) {
          const hourNum = Math.floor(minNum / 60);
      
          if (currentDayTime < 60) {
            return `${currentDayTime} second${currentDayTime === 1 ? '' : 's'} ago`;
          } else if (currentDayTime < 3600) {
            const singularOrPlural = minNum < 2 ? 'minute' : 'minutes';
            return `${minNum} ${singularOrPlural} ago`;
          } else if (hourNum < 24) {
            const singularOrPlural = hourNum < 2 ? 'hour' : 'hours';
            return `${hourNum} ${singularOrPlural} ago`;
          } else {
            return normalDate.replace(`, ${today.getFullYear()}`, '');
          }
        } else {
          return normalDate;
        }
      };
   
    let[questionsList,setQuestions] = useState([]);
    let [questionCounter, setQuestionCounter] = useState(0);
    console.log(questionCounter);
    let [questionsFilter, setQuestionsFilter] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8000/questions').then(res => {
            
        setQuestions(res.data);
        setQuestionsFilter(res.data)
        setQuestionCounter(res.data.length);
    
    });
    }, [setQuestionCounter]);

    let [tagsButtonList,setTags] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:8000/tags').then(res => {setTags(res.data)});
    }, [])

    let [answersList,setAnswersList] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:8000/answers').then(res => {setAnswersList(res.data)});
    }, []);
    let [usersList,setUsersList] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:8000/users').then(res => {setUsersList(res.data)});
    }, []);
   
    let [currentPage, setCurrentPage] = useState(1);
    let [totalPages] = useState(1);
    const itemsPerPage = 5;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    questionsFilter = questionsFilter.slice(indexOfFirstItem, indexOfLastItem);

    totalPages = Math.ceil(questionsList.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage === Math.ceil(questionsList.length / itemsPerPage)) {
            return;
          }
        else{
        setCurrentPage(currentPage + 1);
        }
    };

    const filterForTag = (tagId) => {
        resetTag(tagId);
        if(admin){setUsername(adminName); setUserId(adminId);}
        setInUsers(false);
        displayContent('Questions');
    }

    const handlePrevPage = () => {
        if (currentPage === 1) {
            return;
          }
          else{
        setCurrentPage(currentPage - 1);
          }
    };

    const currentUser = usersList.find(user => user._id === userId)
    useEffect(() => {
        let isMounted = true;
    
        const filterQuestions = () => {
          if (answersList.length > 0 && currentUser && isMounted) {
            const filteredQuestions = questionsList.filter((question) => {
              return question.answers.some((answerId) => {
                const answer = answersList.find((answer) => answer._id === answerId);
                return answer && answer.ans_By === currentUser._id;
              });
            });
    
            if (isMounted) {
              setQuestionsFilter(filteredQuestions);
            }
          }
        };
    
        filterQuestions();
    
        return () => {
          isMounted = false;
        };
      }, [answersList, currentUser, questionsList]);

    const goToUserAnswers = (id) => {
        selectQuestion(id);
        displayContent('UsersAnswers');
    }

    let tableItems;
    if(usersList.length > 0){
        if(questionsFilter.length > 0){
            tableItems = questionsFilter.map(
                question => 
                <tr key={question._id}>
                    <td>{question.answers.length} answers<br />{question.views} views</td>
                    <td>
                        <button className = "questionLink" onClick={() => goToUserAnswers(question._id)}>{question.title}</button><br/>
                        {tagsButtonList.filter((tag) => {return question.tags.includes(tag._id)}).map(tagButton => <button key={tagButton._id} className='tagButton'onClick={() => filterForTag(tagButton._id)}>{tagButton.name}</button>)}
                    </td>
                    <td className='votes'>{question.upVotes.length - question.downVotes.length} Votes</td>
                    <td className='colored-askedBy'>{usersList.find(user => user._id === question.asked_by).username} asked  {formatDate(question)}</td>
                </tr>
            );
        } else {
          <tr>
          <td colSpan="5">
            <p>No questions available.</p>
          </td>
        </tr>
        }
        
    }
    return (
        <>
            <div className="main">
                <h1 id="allQuestions">Answered Questions From {username}</h1> 
                <div id="questionList">
                    <table id="questionTable">
                        <tbody>
                        {tableItems}
                        </tbody>
                    </table>
                    <button id = "prev" value="Prev" onClick = {() => handlePrevPage()} disabled={currentPage === 1}> Prev</button>
                    <button id = "next" value="Next" onClick = {() => handleNextPage()} disabled={currentPage === totalPages}> Next</button>
                </div>
            </div>
        </>
        
    );
   
    
    }