import { useState, useEffect } from "react";
import axios from "axios";
export default function UserAnswerPage({ questionId, displayContent, userId, setAnswerId }) {

    let [answersList, setAnswersList] = useState([]);
    let [voteCounter, setVoteCounter] = useState(0);
    console.log(voteCounter);
    let [questionsList, setQuestionsList] = useState([]);
    let [commentsList, setCommentsList] = useState([]);
    console.log(commentsList);
    useEffect(() => {
        axios.get('http://localhost:8000/comments').then(res => { setCommentsList(res.data) });
    }, []);
    useEffect(() => {
        axios.get('http://localhost:8000/answers').then(res => { setAnswersList(res.data) });
    }, []);
    useEffect(() => {
        axios.get('http://localhost:8000/questions').then(res => { setQuestionsList(res.data) });
    }, []);

    let [usersList, setUsersList] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:8000/users').then(res => { setUsersList(res.data) });
    }, []);
    
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    };
    const formatDate = (question) => {
        const convertDate = new Date(question.ans_date_time);
        let normalDate = convertDate.toLocaleString('en-US', options).replace(/,([^,]*)$/, ' at$1');
        const today = new Date();
        const currentDayTime = Math.floor((today.getTime() - convertDate.getTime()) / 1000);
        const minNum = Math.floor(currentDayTime / 60);
      
        if (today.getFullYear() === convertDate.getFullYear()) {
          const hourNum = Math.floor(minNum / 60);
      
          if (currentDayTime < 60) {
            return `${currentDayTime} seconds ago`;
          } else if (currentDayTime < 3600) {
            return minNum < 2 ? `${minNum} minute ago` : `${minNum} minutes ago`;
          } else if (hourNum < 24) {
            return hourNum < 2 ? `${hourNum} hour ago` : `${hourNum} hours ago`;
          } else {
            normalDate = normalDate.replace(`, ${today.getFullYear()}`, '');
            return normalDate;
          }
        } else {
          return normalDate;
        }
      };

    let [currentPage, setCurrentPage] = useState(1);
    let [totalPages] = useState(1);

    const itemsPerPage = 5;

    const handleNextPage = () => {
        if (currentPage < totalPages) {
          setCurrentPage(currentPage + 1);
        }
      };
      
      const handlePrevPage = () => {
        if (currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      };

      let question = questionsList.find(question => question._id === questionId);

      useEffect(() => {
        if (question) {
          setVoteCounter(question.upVotes.length - question.downVotes.length);
        }
      }, [question]);

    
    if (question && usersList.length > 0) {

        totalPages = Math.ceil(answersList.filter((answer) => { return question.answers.includes(answer._id) }).length / itemsPerPage);

        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        answersList = answersList.filter((answer) => { return question.answers.includes(answer._id) }).slice(indexOfFirstItem, indexOfLastItem);

        let tableItemsUser;
        if (usersList.length > 0) {
            const commentTableState = {};
            answersList.forEach((answer) => {
                commentTableState[answer._id] = {
                    currentPage: 1,
                    totalPages: Math.ceil(answer.comments.length / 3),
                };
            });

            const removeAnswerFromQuestion = (answerId, question) => {
                const updatedAnswers = question.answers.filter(answer => answer !== answerId);
                console.log(updatedAnswers);
                const updatedQuestion = { ...question, answers: updatedAnswers };
                axios.put(`http://localhost:8000/questions/${question._id}`, updatedQuestion)
                  .then(response => {
                    console.log(`Success`);
                  })
                  .catch(error => {
                    console.error(`Error removing ${answerId} ${question._id}`, error);
                  });
              }

            const editAnswer = (id) => {
                setAnswerId(id);
                displayContent('EditAnswers');
            }

            const deleteAnswer = (id) => {
                const currentQuestion = questionsList.find(question => question._id === questionId);
                if(currentQuestion){
                    removeAnswerFromQuestion(id, currentQuestion);
                }
                axios.delete(`http://localhost:8000/answers/delete/${id}`)
                    .then(response => {
                        console.log('deleted');
                        let updatedAnswersList = answersList.filter(answer => answer._id !== id)
                        setAnswersList(updatedAnswersList);
                    })
                    .catch(error => {
                        console.error(error)
                    });
            }

            tableItemsUser = answersList.filter((answer) => {
                return question.answers.includes(answer._id) && answer.ans_By === userId;;
            }).map((answer) => {
                return (
                    <tr key= {answer._id}>
                        <td>{answer.text}</td>
                        <td className="votes">{answer.upVotesAns.length - answer.downVotesAns.length} Votes</td>
                        <td>
                            <button className="edit-button" onClick={() => editAnswer(answer._id)}>Edit</button>
                            <button className="delete-button" onClick={() => deleteAnswer(answer._id)}>Delete</button>
                        </td>
                        {usersList.find((user) => user._id === answer.ans_By) && (
                            <td className="colored-askedBy">
                                 <br />
                                answered {formatDate(answer)}
                            </td>
                        )}
                    </tr>
                );
            });
        
        }

        return (
            <>
                <div className="main">
                    <h1 id="allQuestions">Editing Question: {question.title}</h1>
                    <p id="questionCounter">Asked By: {usersList.find((user) => user._id === question.asked_by).username}</p>
 
                    <h5 id = "CheckingRepVote">&nbsp;</h5>
                    <p id="ans-text">{question.text}</p>    
                    <br/>
                    <h2>Your Answers</h2>
                    <table id="questionTable">
                      <tbody>{tableItemsUser}</tbody>
                    </table>

                    <button id="prev" value="Prev" onClick={() => handlePrevPage()} disabled={currentPage === 1}> Prev</button>
                    <button id="next" value="Next" onClick={() => handleNextPage()} disabled={currentPage === totalPages || totalPages === 0}> Next</button>
                </div>
            </>

        );
    } else {
        return (
            <>
                <div className='main'></div>
            </>
        );
    }

}