import { useState, useEffect } from "react";
import axios from "axios";

export default function AskQuestionPage({ displayContent, resetTags, userId }) {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    axios.get("http://localhost:8000/users").then((res) => {
      setUsers(res.data);
    });
  }, []);

  const [tags, setTags] = useState([]);
  useEffect(() => {
    axios.get("http://localhost:8000/tags").then((res) => {
      setTags(res.data);
    });
  }, []);

  const validateInputs = (title, text, tags, summary) => {
    if (!title || !text || !tags || !summary) {
      throw new Error("Invalid Input! Please fill out all fields.");
    }
    if (summary.length > 140) {
      throw new Error("Summary must be 140 characters or shorter.");
    }
    if (title.length > 100) {
      throw new Error("Title must be 100 characters or shorter.");
    }
  };

  const checkTagPermissions = (tags, user) => {
    if (user.rep < 50 && !tags.every((tag) => tags.includes(tag)) && !user.admin) {
      throw new Error("Cannot create new tags, reputation is below 50!");
    }
  };

  const addTagSchema = async (tag) => {
    const tagExist = tags.find((existTag) => existTag.name === tag);

    if (tagExist) {
      return tagExist._id;
    } else {
      const response = await axios.post("http://localhost:8000/newTags", {
        name: tag,
      });
      setTags(response.data);
      return response.data._id;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const title = e.target.questionTitle.value;
      const text = e.target.questionText.value;
      const tags = e.target.questionTags.value.split(" ");
      const summary = e.target.questionSum.value;

      validateInputs(title, text, tags, summary);

      checkTagPermissions(tags, users.find((user) => user._id === userId));

      const tagIdsArray = await Promise.all(tags.map(addTagSchema));

      await axios.post("http://localhost:8000/newQuestions", {
        title,
        text,
        tags: tagIdsArray,
        answers: [],
        asked_by: userId,
        ask_date_time: new Date(),
        views: 0,
        upVotes: [],
        downVotes: [],
        sum: summary,
      });

      resetTags("");
      displayContent("Questions");
    } catch (error) {
      document.getElementById("InvalidCheck").innerHTML = error.message;
    }
  };

  return (
    <>
      <div id="askQuestionPage" className="askQuestionPage">
        <h2>Question Title*</h2>
        <p>
          <i>Limit title to 100 characters or less</i>
        </p>
        <form onSubmit={handleSubmit}>
          <input type="text" id="ask-title" name="questionTitle" maxLength="100" />
          <br />

          <h2>Question Text*</h2>
          <p>
            <i>Add details</i>
          </p>
          <input type="text" id="ask-text" name="questionText" />
          <br />

          <h2>Question Summary*</h2>
          <p>
            <i>Add details</i>
          </p>
          <input type="text" id="ask-summary" name="questionSum" />
          <br />

          <h2>Tags*</h2>
          <p>
            <i>Add keywords separated by whitespace</i>
          </p>
          <input type="text" id="ask-tag" name="questionTags" />
          <br />

          <h2 id="InvalidCheck" className="InvalidCheck">
            &nbsp;
          </h2>

          <button id = "post-question" className="postButton">
            Post Question
          </button>
        </form>
      </div>
    </>
  );
}