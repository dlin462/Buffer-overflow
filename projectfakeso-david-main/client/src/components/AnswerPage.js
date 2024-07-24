import { useState, useEffect } from "react";
import React from "react";
import axios from "axios";
export default function AnswerPage({ questionId, displayContent, username, userId }) {

    let [answersList, setAnswersList] = useState([]);
    let [voteCounter, setVoteCounter] = useState(0);
    let [questionsList, setQuestionsList] = useState([]);
    let [commentsList, setCommentsList] = useState([]);
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

    const displayAnswerQPage = () => {
        displayContent('AnswerQuestion');
    }

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
        const today = new Date();
        const currentDayTime = Math.floor((today.getTime() - convertDate.getTime()) / 1000);
        const minNum = Math.floor(currentDayTime / 60);
    
        if (today.getFullYear() !== convertDate.getFullYear()) {
            return convertDate.toLocaleString('en-US', options).replace(/,([^,]*)$/, ' at$1');
        }
    
        const hourNum = Math.floor(minNum / 60);
    
        return currentDayTime < 60
            ? `${currentDayTime} seconds ago`
            : currentDayTime < 3600
                ? minNum < 2
                    ? `${minNum} minute ago`
                    : `${minNum} minutes ago`
                : hourNum < 24
                    ? hourNum < 2
                        ? `${hourNum} hour ago`
                        : `${hourNum} hours ago`
                    : convertDate.toLocaleString('en-US', options).replace(/,([^,]*)$/, ' at$1');
    };

    let [currentPage, setCurrentPage] = useState(1);
    let [totalPages] = useState(1);
    let [currentCommentPage, setCommentCurrentPage] = useState(1);
    let [totalCommentPages] = useState(1);
    const itemsPerComment = 3;
    const CommentTable = ({ answer, commentsList, usersList }) => {
        const itemsPerAnsComment = 3;
      
        const [currentPage, setCurrentPage] = useState(1);
        const [totalPages, setTotalPages] = useState(
          Math.ceil(answer.comments.length / itemsPerAnsComment)
        );
      
        const handleNextCommentAnsPage = () => {
          if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
          }
        };
      
        const handlePrevCommentAnsPage = () => {
          if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        };
      
        const commentsToDisplay = commentsList
          .filter((comment) => answer.comments.includes(comment._id))
          .slice(
            (currentPage - 1) * itemsPerAnsComment,
            currentPage * itemsPerAnsComment
          );
      
        useEffect(() => {
          setTotalPages(Math.ceil(answer.comments.length / itemsPerAnsComment));
          setCurrentPage(1);
        }, [answer.comments, itemsPerAnsComment]);
      
        return (
          <table>
            <tbody>
              {commentsToDisplay.map((comment) => (
                <tr className="comments" key={comment._id}>
                <td className="comment" >Comment: {comment.text}</td>
                <td className="commentBy">
                  <span className="saidByText">said </span> 
                  <span className="username">{usersList.find((user) => user._id === comment.ans_By).username}</span>
                </td>
                
                <td className="voteButtons">
                  {username && (
                    <button id="upVote" onClick={() => handleUpVoteComment(comment._id)}>
                      Up
                    </button>
                  )}
                </td>
                <td className="votesCount">{comment.upVotesComments.length} Votes</td>
              </tr>

              
              ))}
              <tr>
                <td colSpan="3">
                  <button id ="prev" onClick={handlePrevCommentAnsPage} disabled={currentPage === 1 || totalPages === 0}>
                    Prev
                  </button>
                  <button id ="next" onClick={handleNextCommentAnsPage} disabled={currentPage === totalPages || totalPages === 0}>
                    Next
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        );
      };

    const itemsPerPage = 5;

    const handlePrevCommentPage = () => {
        if (currentCommentPage === 1) {
            return;
        }
        else {
            setCommentCurrentPage(currentCommentPage - 1);
        }
    }

    const handleNextCommentPage = () => {
        if (currentCommentPage === totalCommentPages) {
            return;
        }
        else {
            setCommentCurrentPage(currentCommentPage + 1);
        }
    }

    const handlePrevPage = () => {
        if (currentPage === 1) {
            return;
        }
        else {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage === totalPages) {
            return;
        }
        else {
            setCurrentPage(currentPage + 1);
        }
    }

    const handleUpVote = (questionId) => {
        const question = questionsList.find((q) => q._id === questionId);
        const userUpdateId = question.asked_by;
        const repUpdate = usersList.find((user) => user._id === userUpdateId).rep;
        const repUser = usersList.find((user) => user._id === userId).rep;
        
        if (repUser < 50 && !usersList.find((user) => user._id === userId).admin) {
            document.getElementById("CheckingRepVote").innerHTML = "Your reputation is below 50!";
            return;
        }
    
        const userHasUpVoted = question.upVotes.includes(userId);
        const voteValue = userHasUpVoted ? -5 : 5;
    
        const updatedUpVotes = userHasUpVoted
            ? question.upVotes.filter((id) => id !== userId)
            : question.upVotes.concat(userId);
    
        const updatedDownVotes = userHasUpVoted
            ? question.downVotes
            : question.downVotes.filter((id) => id !== userId);
    
        axios.put(`http://localhost:8000/questions/${questionId}`, {
            upVotes: updatedUpVotes,
            downVotes: updatedDownVotes,
        })
        .then((response) => {
            const updatedQuestionsList = questionsList.map((q) => (
                q._id === questionId
                    ? { ...q, upVotes: updatedUpVotes, downVotes: updatedDownVotes }
                    : q
            ));
    
            setQuestionsList(updatedQuestionsList);
        })
        .catch((error) => {
            console.log('Error', error);
        });
    
        axios.put(`http://localhost:8000/users/${userUpdateId}`, { rep: repUpdate + voteValue })
        .then((response) => {
            const updatedUsersList = usersList.map((u) => (
                u._id === userUpdateId ? { ...u, rep: repUpdate + voteValue } : u
            ));
    
            setUsersList(updatedUsersList);
        })
        .catch((error) => {
            console.log("Error", error);
        });
    };

    const handleDownVote = (questionId) => {
        const question = questionsList.find((q) => q._id === questionId);
        const userUpdateId = question.asked_by;
        const repUpdate = usersList.find((user) => user._id === userUpdateId).rep;
        const repUser = usersList.find((user) => user._id === userId).rep;
    
        if (repUser < 50 && !usersList.find((user) => user._id === userId).admin) {
            document.getElementById("CheckingRepVote").innerHTML = "Your reputation is below 50!";
            return;
        }
    
        const userHasDownVoted = question.downVotes.includes(userId);
        const voteValue = userHasDownVoted ? 10 : -10;
    
        const updatedUpVotes = userHasDownVoted
            ? question.upVotes
            : question.upVotes.filter((id) => id !== userId);
    
        const updatedDownVotes = userHasDownVoted
            ? question.downVotes.filter((id) => id !== userId)
            : question.downVotes.concat(userId);
    
        axios.put(`http://localhost:8000/questions/${questionId}`, {
            upVotes: updatedUpVotes,
            downVotes: updatedDownVotes,
        })
        .then((response) => {
            const updatedQuestionsList = questionsList.map((q) => (
                q._id === questionId
                    ? { ...q, upVotes: updatedUpVotes, downVotes: updatedDownVotes }
                    : q
            ));
    
            setQuestionsList(updatedQuestionsList);
        })
        .catch((error) => {
            console.log('Error', error);
        });
    
        axios.put(`http://localhost:8000/users/${userUpdateId}`, { rep: repUpdate + voteValue })
        .then((response) => {
            const updatedUsersList = usersList.map((u) => (
                u._id === userUpdateId ? { ...u, rep: repUpdate + voteValue } : u
            ));
    
            setUsersList(updatedUsersList);
        })
        .catch((error) => {
            console.log("Error", error);
        });
    };

    const handleUpVoteAns = (answerId) => {
        const answer = answersList.find((a) => a._id === answerId);
        const userUpdateId = answer.ans_By;
        const repUpdate = usersList.find((user) => user._id === userUpdateId).rep;
        const repUser = usersList.find((user) => user._id === userId).rep;
    
        if (repUser < 50 && !usersList.find((user) => user._id === userId).admin) {
            document.getElementById("CheckingRepVote").innerHTML = "Your reputation is below 50!";
            return;
        }
    
        const userHasUpVoted = answer.upVotesAns.includes(userId);
        const voteValue = userHasUpVoted ? -5 : 5;
    
        const updatedUpVotesAns = userHasUpVoted
            ? answer.upVotesAns.filter((id) => id !== userId)
            : answer.upVotesAns.concat(userId);
    
        const updatedDownVotesAns = userHasUpVoted
            ? answer.downVotesAns
            : answer.downVotesAns.filter((id) => id !== userId);
    
        axios.put(`http://localhost:8000/answers/${answerId}`, {
            upVotesAns: updatedUpVotesAns,
            downVotesAns: updatedDownVotesAns,
        })
        .then((response) => {
            const updatedAnswersList = answersList.map((a) => (
                a._id === answerId
                    ? { ...a, upVotesAns: updatedUpVotesAns, downVotesAns: updatedDownVotesAns }
                    : a
            ));
    
            setAnswersList(updatedAnswersList);
        })
        .catch((error) => {
            console.log('Error', error);
        });
    
        axios.put(`http://localhost:8000/users/${userUpdateId}`, { rep: repUpdate + voteValue })
        .then((response) => {
            const updatedUsersList = usersList.map((u) => (
                u._id === userUpdateId ? { ...u, rep: repUpdate + voteValue } : u
            ));
    
            setUsersList(updatedUsersList);
        })
        .catch((error) => {
            console.log("Error", error);
        });
    };

    const handleDownVoteAns = (answerId) => {
        const answer = answersList.find((a) => a._id === answerId);
        console.log(answer);
        const userUpdateId = answer.ans_By;
        const repUpdate = usersList.find((user) => user._id === userUpdateId).rep;
        const repUser = usersList.find((user) => user._id === userId).rep;
    
        if (repUser < 50 && !usersList.find((user) => user._id === userId).admin) {
            document.getElementById("CheckingRepVote").innerHTML = "Your reputation is below 50";
            return;
        }
    
        const userHasDownVoted = answer.downVotesAns.includes(userId);
        const voteValue = userHasDownVoted ? 10 : -10;
    
        const updatedUpVotesAns = userHasDownVoted
            ? answer.upVotesAns
            : answer.upVotesAns.filter((id) => id !== userId);
    
        const updatedDownVotesAns = userHasDownVoted
            ? answer.downVotesAns.filter((id) => id !== userId)
            : answer.downVotesAns.concat(userId);

        axios.put(`http://localhost:8000/answers/${answerId}`, {
            upVotesAns: updatedUpVotesAns,
            downVotesAns: updatedDownVotesAns,
        })
        
        .then((response) => {
            const updatedAnswersList = answersList.map((a) => (
                a._id === answerId
                    ? { ...a, upVotesAns: updatedUpVotesAns, downVotesAns: updatedDownVotesAns }
                    : a
            ));
    
            setAnswersList(updatedAnswersList);
        })
        .catch((error) => {
            console.log('Error', error);
        });
    
        axios.put(`http://localhost:8000/users/${userUpdateId}`, { rep: repUpdate + voteValue })
        .then((response) => {
            const updatedUsersList = usersList.map((u) => (
                u._id === userUpdateId ? { ...u, rep: repUpdate + voteValue } : u
            ));
    
            setUsersList(updatedUsersList);
        })
        .catch((error) => {
            console.log("Error", error);
        });
    };


    let question = questionsList.find(question => question._id === questionId);
    useEffect(() => {
        if (question) {
            setVoteCounter(question.upVotes.length - question.downVotes.length);
        }
    }, [question]);

    const handleUpVoteComment = (commentId) => {
        const comment = commentsList.find((comment) => comment._id === commentId);
        const userHasUpVoted = comment.upVotesComments.includes(userId);

        let updatedUpVotesComments = comment.upVotesComments;

        if (userHasUpVoted) {

            updatedUpVotesComments = updatedUpVotesComments.filter((id) => id !== userId);
        } else {


            updatedUpVotesComments = updatedUpVotesComments.concat(userId);
        }
        axios.put(`http://localhost:8000/comments/${commentId}`, {
            upVotesComments: updatedUpVotesComments,

        })
            .then((response) => {

                const updatedCommentsList = commentsList.map((c) => {
                    if (c._id === commentId) {
                        return {
                            ...c,
                            upVotesComments: updatedUpVotesComments,

                        };
                    }
                    return c;
                });

                setCommentsList(updatedCommentsList);
            })
            .catch((error) => {
                console.log('Error', error);
            });

    }
    if (question && usersList.length > 0) {
        let questionCommentsList = commentsList;
        let answerCommentsList = commentsList;
        totalPages = Math.ceil(answersList.filter((answer) => { return question.answers.includes(answer._id) }).length / itemsPerPage);
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        answersList = answersList.filter((answer) => { return question.answers.includes(answer._id) }).slice(indexOfFirstItem, indexOfLastItem);

        const handleCommentSubmit = (e) => {
            e.preventDefault();
           
            const text = e.target.commentText.value;
            const ans_By = userId;
            let repUser = usersList.find((user) => user._id === userId).rep;

            if (text === "") {
                document.getElementById("CheckingComment").innerHTML = "Invalid";
                console.log("rejected!");
            } 
            else if(repUser < 50 && !usersList.find((user) => user._id === userId).admin){
                document.getElementById("CheckingComment").innerHTML = "your reputation is below 50";
            }
            else if(text.length > 140){
                document.getElementById("CheckingAnswerComment").innerHTML = "(140 max)";
            }
            else{
                document.getElementById("CheckingComment").innerHTML = "";
                console.log("posted!");
                axios.post('http://localhost:8000/newComments', {
                    text: text,
                    ans_By: ans_By,
                }).then(async (res) => {
                    const commentId = res.data._id;

                    const updatedQuestionsList = [...questionsList];
                    const questionIndex = updatedQuestionsList.findIndex(question => question._id === questionId);

                    if (questionIndex !== -1) {
                        updatedQuestionsList[questionIndex].comments.push(commentId);
                        setQuestionsList(updatedQuestionsList);

                        await axios.put(`http://localhost:8000/questions/${questionId}`, { comments: updatedQuestionsList[questionIndex].comments }).then(
                            (response) => {
                                setCommentsList([...commentsList, res.data]);
                                displayContent('Answers');
                            }
                        ).catch((error) => {
                            console.log('Error', error);
                        });
                    }

                    e.target.commentText.value = ""
                }).catch((error) => {
                    console.log('Error', error);
                });
            }
        };

        const handleAnswerCommentSubmit = (e, answerId) => {
            e.preventDefault();
            const text = e.target.commentAnsText.value;
            const ans_By = userId;
            let repUser = usersList.find((user) => user._id === userId).rep;
            if (text === "") {
                document.getElementById("CheckingAnswerComment").innerHTML = "Invalid";
            } 
            else if(repUser < 50 && !usersList.find((user) => user._id === userId).admin){
                document.getElementById("CheckingAnswerComment").innerHTML = "your reputation is below 50";
            }else if(text.length > 140){
                document.getElementById("CheckingAnswerComment").innerHTML = "(140 max)";
            }
            else{
                document.getElementById("CheckingAnswerComment").innerHTML = "";
                axios
                    .post("http://localhost:8000/newComments", {
                        text: text,
                        ans_By: ans_By,
                    })
                    .then(async (res) => {
                        const commentId = res.data._id;

                        const updatedAnswersList = [...answersList];
                        const answerIndex = updatedAnswersList.findIndex(
                            (answer) => answer._id === answerId
                        );
                        if (answerIndex !== -1) {
                            updatedAnswersList[answerIndex].comments.push(commentId);

                            if (setAnswersList) {
                                setAnswersList(updatedAnswersList);
                            }

                            if (setCommentsList) {
                                setCommentsList([...commentsList, res.data]);
                            }

                            await axios
                                .put(`http://localhost:8000/answers/${answerId}`, {
                                    comments: updatedAnswersList[answerIndex].comments,
                                })
                                .then(() => {
                                    e.target.commentAnsText.value = "";
                                    displayContent("Answers");
                                })
                                .catch((error) => {
                                    console.log("Error", error);
                                });
                        }
                    })
                    .catch((error) => {
                        console.log("Error", error);
                    });
            }
        };

        totalCommentPages = Math.ceil(question.comments.length / itemsPerComment);
        const indexOfLastComment = currentCommentPage * itemsPerComment;
        const indexOfFirstComment = indexOfLastComment - itemsPerComment;
        questionCommentsList = commentsList.filter((comment) => { return question.comments.includes(comment._id) }).slice(indexOfFirstComment, indexOfLastComment);
        let commentItems;
        if (usersList.length > 0) {
            commentItems = questionCommentsList
              .filter((comment) => question.comments.includes(comment._id))
              .map((comment) => (
                <tr className="comments" key={comment._id}>
                  <td className="comment">
                    Comment: {comment.text}{' '}
                    <span className="saidByText">said </span>
                    <span className="username">{usersList.find((user) => user._id === comment.ans_By).username}</span>
                  </td>
          
                  <td className="voteButtons">
                    {username && (
                      <button id="upVote" onClick={() => handleUpVoteComment(comment._id)}>
                        Up
                      </button>
                    )}
                  </td>
          
                  <td className="votesCount" style={{}}>
                    {comment.upVotesComments.length} Votes
                  </td>
                </tr>
              ));
          }

        let tableItems;
        if (usersList.length > 0) {
        const commentTableState = {};
        answersList.forEach((answer) => {
            commentTableState[answer._id] = {
            currentPage: 1,
            totalPages: Math.ceil(answer.comments.length / 3),
            };
        });

        tableItems = answersList
        .filter((answer) => question.answers.includes(answer._id))
        .map((answer) => {
            let answersComment = answerCommentsList.filter((comment) => answer.comments.includes(comment._id));
            return (
                <React.Fragment key={answer._id}>
                    <tr className="voteButtonsRow">
                        <td colSpan="5" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <div className="voteButtons" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <h4 className="votesCount">{answer.upVotesAns.length - answer.downVotesAns.length} Votes</h4>
                                {username && <button id="upVote" onClick={() => handleUpVoteAns(answer._id)}>Up</button>}
                                {username && <button id="downVote" style={{ marginRight: '0px' }} onClick={() => handleDownVoteAns(answer._id)}>Down</button>}
                            </div>
                        </td>
                    </tr>
            
                    <tr className="answerContent">
                        <td colSpan="5" style={{ maxWidth: '1200px', wordWrap: 'break-word' }}>
                            {answer.text}
                        </td>
                    </tr>
                
                    {usersList.find((user) => user._id === answer.ans_By) && (
                        <tr>
                            <td className="colored-answeredBy" colSpan="5">
                                <span>{usersList.find((user) => user._id === answer.ans_By).username}</span>
                                <span> answered {formatDate(answer)}</span>
                            </td>
                        </tr>
                    )}
                
                    <tr>
                        <td id="commentTable" colSpan="5">
                            <CommentTable
                                answer={answer}
                                commentsList={answersComment}
                                usersList={usersList}
                                commentTableState={commentTableState}
                            />
                        </td>
                    </tr>
                
                    <tr className="answerCommentForm">
                        <td colSpan="5">
                            {username && (
                                <form onSubmit={(e) => handleAnswerCommentSubmit(e, answer._id)}>
                                    <input type="text" id="commentText" name="commentAnsText" /><br />
                                    <button type="submit" className="postComment">Post Comment</button>
                                    <h2 id="CheckingAnswerComment" className="InvalidCheck">&nbsp;</h2>

                                </form>
                            )}
                        </td>
                    </tr>
                </React.Fragment>
            );
        });
        }

        return (
            <>
                <div className="main">
                {username && <button id="answer-question-button" onClick={displayAnswerQPage}> Answer Question </button>}
                <div className="questiontitle">{question.title}</div>
                    <div id="colored-askedBy1">Asked By: {usersList.find((user) => user._id === question.asked_by).username}</div>
                    <div className="questionDetails">
                    <div>
                        <div className="numberOfAnswers">{question.answers.length} Answers</div>
                        <div className="NumberOfViews">{question.views} Views</div>
                    </div>

                    <div className="voteButtons" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <h4 className="votesCount">{voteCounter} Votes</h4>
                        {username && <button id="upVote" onClick={() => handleUpVote(question._id)}>Up</button>}
                        {username && <button id="downVote" style={{ marginRight: '25px' }} onClick={() => handleDownVote(question._id)}>Down</button>}
                    </div>
                    </div>
                    <h5 id = "CheckingRepVote">&nbsp;</h5>
                    
                    <p id="ans-text">{question.text}</p>

                    <table id="commentTable">
                        <tbody>
                            {commentItems}
                        </tbody>
                    </table>
                    <button id="prev" value="Prev" onClick={() => handlePrevCommentPage()} disabled={currentCommentPage === 1}> Prev</button>
                        <button id="next" value="Next" onClick={() => handleNextCommentPage()} disabled={currentCommentPage === totalCommentPages || totalCommentPages === 0}> Next</button>
                        {username && <form onSubmit={handleCommentSubmit}>
                            <input type="text" id="commentText" name="commentAnsText" /><br />
                            <button type="submit" className="postComment">Post Comment</button>
                            <h2 id="CheckingComment" className="InvalidCheck">&nbsp;</h2>
                        </form>}
                        


                    <table id="questionTable">
                        <tbody>
                            {tableItems}
                        </tbody>
                    </table>
                    <button id="prev" value="Prev" onClick={() => handlePrevPage()} disabled={currentPage === 1}> Prev</button>
                    <button id="next" value="Next" onClick={() => handleNextPage()} disabled={currentPage === totalPages || totalPages === 0}> Next</button>
                </div>
            </>

        );
    } else {
        return (
            <>
                <div className='main'>
                </div>

            </>
        );
    }

}