import { useState } from 'react';
import Banner from './Banner';
import SideBar from './SideBar';
import QuestionsPage from './QuestionsPage';
import TagsPage from './TagsPage';
import AskQuestionPage from './AskQuestionPage';
import AnswerPage from './AnswerPage';
import AnswerQPage from './AnswerQPage';
import UserProfile from './UserProfile';
import ModifyQuestionPage from './ModifyQuestionPage';
import UsersQuestions from './UsersQuestions';
import UsersTags from './UsersTags';
import UserAnswerPage from './UserAnswerPage';
import EditAnswerPage from './EditAnswerPage';
import EditTags from './EditTags';
import AdminUserProfile from './AdminUserProfile';

export default function Content({
  setPage,
  setUsername,
  setUserId,
  username,
  userId,
  admin,
  adminId,
  adminName,
  setAdmin,
  setAdminId,
  setAdminName,
}) {
  const [content, setContent] = useState('Questions');
  const [searchI, setSearch] = useState('');
  const [answerId, setAnswerId] = useState('');
  const [tagId, setTagId] = useState('');
  const [inUsers, setInUsers] = useState(false);
  const [changeAnswerId, setChangeAnswerId] = useState('');
  const [changeTagId, setChangeTagId] = useState('');

  const renderPage = (pageComponent) => (
    <>
      <Banner
        changeSearch={setSearch}
        username={username}
        setUsername={setUsername}
        setUserId={setUserId}
        setContent={setContent}
        setPage={setPage}
        setInUsers={setInUsers}
        admin={admin}
        setAdmin={setAdmin}
        setAdminId={setAdminId}
        setAdminName={setAdminName}
        adminName={adminName}
      />
      <SideBar
        displayContent={setContent}
        resetTags={setTagId}
        inUsers={inUsers}
        setInUsers={setInUsers}
        admin={admin}
        adminId={adminId}
        adminName={adminName}
        setUserId={setUserId}
        setUsername={setUsername}
      />
      {pageComponent}
    </>
  );

  switch (content) {
    case 'Questions':
      return renderPage(
        <QuestionsPage
          searchInput={searchI}
          displayContent={setContent}
          findAnswerById={setAnswerId}
          specificTag={tagId}
          resetTag={setTagId}
          username={username}
        />
      );
    case 'Answers':
      return renderPage(
        <AnswerPage
          questionId={answerId}
          displayContent={setContent}
          username={username}
          userId={userId}
        />
      );
    case 'Tags':
      return renderPage(
        <TagsPage
          displayContent={setContent}
          selectTag={setTagId}
        />
      );
    case 'AskQuestion':
      return renderPage(
        <AskQuestionPage
          displayContent={setContent}
          resetTags={setTagId}
          userId={userId}
        />
      );
    case 'AnswerQuestion':
      return renderPage(
        <AnswerQPage
          questionId={answerId}
          displayContent={setContent}
          userId={userId}
        />
      );
    case 'AdminUserProfile':
      return renderPage(
        <AdminUserProfile
          userId={userId}
          username={username}
          setContent={setContent}
          setQuestionId={setAnswerId}
          tagId={tagId}
          setTagId={setTagId}
          adminName={adminName}
          adminId={adminId}
          setUsername={setUsername}
          setUserId={setUserId}
          setInUsers={setInUsers}
        />
      );
    case 'UserProfile':
      return renderPage(
        <UserProfile
          userId={userId}
          username={username}
          setContent={setContent}
          setQuestionId={setAnswerId}
          setTagId={setTagId}
          setInUsers={setInUsers}
          admin={admin}
          adminId={adminId}
          adminName={adminName}
          setUserId={setUserId}
          setUsername={setUsername}
        />
      );
    case 'ModifyQuestion':
      return renderPage(
        <ModifyQuestionPage
          displayContent={setContent}
          resetTags={setTagId}
          questionId={answerId}
        />
      );
    case 'UsersQuestions':
      return renderPage(
        <UsersQuestions
          displayContent={setContent}
          resetTag={setTagId}
          userId={userId}
          username={username}
          setInUsers={setInUsers}
          selectQuestion={setAnswerId}
          admin={admin}
          adminId={adminId}
          adminName={adminName}
          setUserId={setUserId}
          setUsername={setUsername}
        />
      );
    case 'UsersTags':
      return renderPage(
        <UsersTags
          displayContent={setContent}
          selectTag={setTagId}
          userId={userId}
          username={username}
          setInUsers={setInUsers}
          setChangeTagId={setChangeTagId}
        />
      );
    case 'UsersAnswers':
      return renderPage(
        <UserAnswerPage
          questionId={answerId}
          displayContent={setContent}
          username={username}
          userId={userId}
          setAnswerId={setChangeAnswerId}
          admin={admin}
          adminId={adminId}
          adminName={adminName}
          setUserId={setUserId}
        />
      );
    case 'EditAnswers':
      return renderPage(
        <EditAnswerPage
          questionId={changeAnswerId}
          displayContent={setContent}
          username={username}
          userId={userId}
          setAnswerId={setAnswerId}
        />
      );
    case 'EditTags':
      return renderPage(
        <EditTags
          changeTagId={changeTagId}
          displayContent={setContent}

        />
      );
    default:
      return (
        <>
          <div id="header" className="header">
            <h1>Nothing to display</h1>
          </div>
        </>
      );
  }
}