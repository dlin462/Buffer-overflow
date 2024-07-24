import axios from "axios";

export default function EditTags({ changeTagId, displayContent }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const text = e.target.responseText.value;

    if (text === "") {
      document.getElementById("CheckingInvalid").innerHTML = "Invalid Input";
    } else {
      axios
        .put(`http://localhost:8000/tags/${changeTagId}`, {
          name: text,
        })
        .then(async (res) => {
          console.log('Successfully edited tag');
          displayContent('UsersTags');
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <>
      <div id="editTagsPage" className="main">
        <form onSubmit={handleSubmit}>
          <h1>Edit Tag*</h1>
          <input type="text" id="ask-text" name="responseText" className="edit-tags-input" /><br />
          <h2 id="CheckingInvalid" className="edit-tags-invalid-check">
            &nbsp;
          </h2>
          <button type="submit" className="ask-button-tag">
            Update Tag
          </button>
        </form>
      </div>
    </>
  );
}