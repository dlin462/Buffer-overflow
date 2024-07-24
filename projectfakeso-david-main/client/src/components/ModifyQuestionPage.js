import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ModifyQuestionPage({ displayContent, resetTags, questionId }) {
  const [tagsList, setTags] = useState([]);
  const [questionsList, setQuestions] = useState([]);

  useEffect(() => {
    const fetchTagsAndQuestions = async () => {
      try {
        const tagsResponse = await axios.get('http://localhost:8000/tags');
        const questionsResponse = await axios.get('http://localhost:8000/questions');

        setTags(tagsResponse.data);
        setQuestions(questionsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchTagsAndQuestions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const questionTitle = e.target.questionTitle.value;
    const questionText = e.target.questionText.value;
    const questionTags = e.target.questionTags.value.split(" ");
    const questionSum = e.target.questionSum.value;

    if (questionTitle === "" || questionText === "" || questionTags.length === 0 || questionSum === "") {
      document.getElementById("InvalidCheck").innerHTML = "Invalid Input";
    } else {
      document.getElementById("InvalidCheck").innerHTML = "";

      const tagIdsArray = [];

      try {
        for (const tag of questionTags) {
          const existingTag = tagsList.find((existTag) => existTag.name === tag);

          if (existingTag) {
            tagIdsArray.push(existingTag._id);
          } else {
            const response = await axios.post('http://localhost:8000/newTags', { name: tag });
            const newTagId = response.data._id;
            tagIdsArray.push(newTagId);
            console.log(`Added tag "${tag}" with ID ${newTagId}`);
          }
        }

        await axios.put(`http://localhost:8000/questions/${questionId}`, {
          title: questionTitle,
          text: questionText,
          tags: tagIdsArray,
          sum: questionSum,
        });

        const updatedTagsResponse = await axios.get('http://localhost:8000/tags');
        setTags(updatedTagsResponse.data);

        resetTags("");
        displayContent("UserProfile");
      } catch (error) {
        console.error("Error updating question:", error);
      }
    }
  };

  if (questionsList.length > 0) {

    return (
      <div className="main">
        <h1 className="pageTitle"> Change Title of Question*</h1>
        <form onSubmit={handleSubmit}>
          <input type="text" id="ask-title" name="questionTitle" maxLength="100" /><br />

          <h1>Question Text*</h1>
          <p><i>Add details*</i></p>
          <input type="text" id="ask-text" name="questionText" /><br />

          <h1>Question Summary*</h1>
          <p><i>Add details*</i></p>
          <input type="text" id="ask-summary" name="questionSum" /><br />

          <h1>Tags*</h1>
          <p><i>Add keywords separated by whitespace*</i></p>
          <input type="text" id="ask-tag" name="questionTags" /><br />

          <h2 id="InvalidCheck" className="InvalidCheck">&nbsp;</h2>
          <button type="submit" className="ask-button">Update Question</button>
        </form>
      </div>
    );
  } else {
    return null;
  }
}