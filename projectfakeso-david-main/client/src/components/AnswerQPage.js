import { useState, useEffect } from "react";
import axios from "axios";

export default function AnswerQPage({ questionId, displayContent, userId }) {
  const [questionsList, setQuestionsList] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/questions').then(res => {
      setQuestionsList(res.data);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const text = e.target.responseText.value;

    if (text === "") {
      document.getElementById("CheckingInvalid").innerHTML = "Invalid Input";
    } else {
      try {
        const response = await axios.post('http://localhost:8000/newAnswers', {
          text: text,
          ans_By: userId,
          ans_date_time: new Date()
        });

        const answerId = response.data._id;
        const updatedQuestionsList = [...questionsList];
        const questionIndex = updatedQuestionsList.findIndex(question => question._id === questionId);

        if (questionIndex !== -1) {
          updatedQuestionsList[questionIndex].answers.push(answerId);
          setQuestionsList(updatedQuestionsList);

          await axios.put(`http://localhost:8000/questions/${questionId}`, { answers: updatedQuestionsList[questionIndex].answers });
          displayContent('Answers');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div id="responsePage" className="main">
      <form onSubmit={handleSubmit}>
        <h2>Answer*</h2>
        <input type="text" id="ask-text" name="responseText" /><br />
        <h2 id="CheckingInvalid" className="InvalidCheck">&nbsp;</h2>
        <button type="submit" id="post-question">Post Answer</button>
      </form>
    </div>
  );
}