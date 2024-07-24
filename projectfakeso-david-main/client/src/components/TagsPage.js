import React, { useState, useEffect } from "react";
import axios from "axios";

const TagsPage = ({ displayContent, selectTag }) => {
  const [tagsList, setTags] = useState([]);
  const [questionsList, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    axios.get('http://localhost:8000/tags').then(res => {
      setTags(res.data);
    });

    axios.get('http://localhost:8000/questions').then(res => {
      setQuestions(res.data);
    });
  }, []);

  const displayQuestionsForTag = (tagId) => {
    selectTag(tagId);
    displayContent('Questions');
  };

  const totalPages = Math.ceil(tagsList.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const renderTags = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTags = tagsList.slice(startIndex, endIndex);

    return currentTags.map(tag => (
      <div key={tag._id} className="tagCell">
        <button className="question-title" onClick={() => displayQuestionsForTag(tag._id)}>
          {tag.name}
        </button>
        <p>{questionsList.filter(question => question.tags.includes(tag._id)).length} Questions</p>
      </div>
    ));
  };

  return (
    <div className="main">
      <h1 id='allQuestions'>All Tags</h1>
      <h1 id='questionCounter'>{tagsList.length} Tags</h1>

      <div className="tags-container">{renderTags()}</div>
      <div className="pagination">
        <button id="prev" onClick={handlePrevPage} disabled={currentPage === 1}>Prev</button>
        <button id="next" onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
      </div>
    </div>
  );
};

export default TagsPage;
