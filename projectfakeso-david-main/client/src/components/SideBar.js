

export default function SideBar({displayContent, resetTags, inUsers, setInUsers, adminName, adminId, admin, setUsername, setUserId}) {

    const displayQuestionsPage = () =>{
        resetTags('');
        setInUsers(false)
        if(admin){setUserId(adminId); setUsername(adminName)}
        displayContent('Questions');
    }
    const displayTagPage = () => {
        setInUsers(false)
        if(admin){setUserId(adminId); setUsername(adminName)}
        displayContent('Tags');
    }

    const questionsAnswered = () => {
        displayContent('UsersQuestions')
    }

    const tagsCreated = () => {
        displayContent('UsersTags')
    }
    
    return(
        <>
        <div className="menu">
        <div id="question" >
            <button onClick={displayQuestionsPage} className='menuButton'>Questions</button>
        </div>
        <div id="tag">
            <button onClick={displayTagPage} className='menuButton'>Tags</button>
        </div>
        <div>
            {inUsers && <button className='menuButton' onClick={questionsAnswered}>Questions Answered</button>}
        </div>
        <div>
            {inUsers && <button className='menuButton' onClick={tagsCreated}>Tags Created</button>}
        </div>
        </div>

        
        </>
    );  
}