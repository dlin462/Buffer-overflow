import axios from "axios";

export default function EditAnswerPage({ questionId, displayContent }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.responseText.value;

    try {
      if (!text) {
        document.getElementById("CheckingInvalid").innerHTML = "Invalid Input";
      } else {
        await axios.put(`http://localhost:8000/answers/${questionId}`, {
          text: text,
        });
        console.log('Successfully edited answer');
        displayContent('UsersAnswers');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="main">
      <form onSubmit={handleSubmit}>
        <h2>Edit Answer Text*</h2>
        <input type="text" id="ask-text" name="responseText" />
        <br />

        <h2 id="CheckingInvalid" className="invalid-check">
          &nbsp;
        </h2>
        <button type="submit" className="ask-button-tag">
          Post Answer
        </button>
      </form>
    </div>
  );
}
