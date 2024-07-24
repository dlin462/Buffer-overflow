import React, { useState, useEffect } from "react";
import axios from "axios";

export default function UsersTags({
  displayContent,
  selectTag,
  username,
  userId,
  setInUsers,
  setChangeTagId,
  admin,
  adminName,
  adminId,
  setUsername,
  setUserId,
}) {
  const [tagsList, setTags] = useState([]);
  const [questionsList, setQuestions] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/tags").then((res) => setTags(res.data));
    axios.get("http://localhost:8000/questions").then((res) => setQuestions(res.data));
  }, []);

  const userQuestions = questionsList.filter((question) => question.asked_by === userId);
  const userTags = tagsList.filter((tag) =>
    userQuestions.some((question) => question.tags.includes(tag._id))
  );

  const removeTagFromQuestion = (id, tagId) => {
    const currentQuestion = questionsList.find((question) => question._id === id);
    const updatedTags = currentQuestion.tags.filter((tag) => tag !== tagId);

    axios
      .put(`http://localhost:8000/questions/${id}`, { tags: updatedTags })
      .then((response) => {
        console.log(`deleted answer tag from question`);
      })
      .catch((error) => {
        console.error(`Error`, error);
      });
  };

  const deleteTag = (id) => {
    let questionsWithSpecificTag = questionsList.filter((question) => question.tags.includes(id));

    if (questionsWithSpecificTag.length > 0) {
      if (questionsWithSpecificTag.some((question) => question.asked_by !== userId)) {
        console.log("Tag used by other users");
        document.getElementById("checkDelete").innerHTML =
          "This tag is used by another user";
        return;
      } else {
        questionsWithSpecificTag.forEach((element) => {
          removeTagFromQuestion(element._id, id);
        });

        axios
          .delete(`http://localhost:8000/tags/delete/${id}`)
          .then((response) => {
            let updatedTagsList = tagsList.filter((tag) => tag._id !== id);
            setTags(updatedTagsList);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
  };

  const editTag = (id) => {
    let questionsWithSpecificTag = questionsList.filter((question) => question.tags.includes(id));

    if (questionsWithSpecificTag.length > 0) {
      if (questionsWithSpecificTag.some((question) => question.asked_by !== userId)) {
        document.getElementById("checkDelete").innerHTML =
          "This tag is used by another user";
        return;
      } else {
        setChangeTagId(id);
        displayContent("EditTags");
      }
    }
  };

  const displayQuestionsForTag = (tagId) => {
    selectTag(tagId);

    if (admin) {
      setUsername(adminName);
      setUserId(adminId);
    }

    setInUsers(false);
    displayContent("Questions");
  };

  const itemsPerRow = 3;
  const rows = [];

  for (let i = 0; i < userTags.length; i += itemsPerRow) {
    const rowItems = userTags.slice(i, i + itemsPerRow).map((tag) => (
      <td key={tag._id} className="tag-cell">
        <div className="tag-container">
          <button className="tag-button" onClick={() => displayQuestionsForTag(tag._id)}>
            {tag.name}
          </button>
          <p>{questionsList.filter((question) => question.tags.includes(tag._id)).length} Questions</p>
          <div className="edit-buttons-container">
            <button className="edit-button" onClick={() => editTag(tag._id)}>
              Edit
            </button>
            <button className="delete-button" onClick={() => deleteTag(tag._id)}>
              Delete
            </button>
          </div>
        </div>
      </td>
    ));

    const row = <tr key={i}>{rowItems}</tr>;
    rows.push(row);
  }

  let tableItems;

  if (rows.length > 0) {
    tableItems = (
      <table id="tagTable">
        <tbody>{rows}</tbody>
      </table>
    );
  } else {
    <tr>
          <td colSpan="5">
            <p>No Tags Found</p>
          </td>
        </tr>
  }

  return (
    <div className="main">
      <h1 id="allQuestions">{username}'s Tags</h1>
      <h1 id="questionCounter">{userTags.length} Tags</h1>
      <p className="invalid-check" id="checkDelete"></p>
      <div className="tags-table-container">{tableItems}</div>
    </div>
  );
}