// Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.
const bcrypt = require('bcrypt');
let userArgs = process.argv.slice(2);

let adminPassword = userArgs[0];

if (!userArgs[1].startsWith('mongodb')) {
  console.log('ERROR');
  return
}

let Question = require('./models/questions')
let Answer = require('./models/answers')
let Tag = require('./models/tags')
let User = require('./models/users')
let Comment = require('./models/comments')

let mongoose = require('mongoose');

mongoose.connect(userArgs[1], { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB error'));

function questionCreate(title, text, tags, answers, asked_by, ask_date_time, views, comments) {
    qstndetail = {
      title: title,
      text: text,
      tags: tags,
      asked_by: asked_by,
      upVotes: [],
      downVotes: [],
    }
    if (answers != false) qstndetail.answers = answers;
    if (comments != false) qstndetail.comments = comments;
    if (ask_date_time != false) qstndetail.ask_date_time = ask_date_time;
    if (views != false) qstndetail.views = views;
  
    let qstn = new Question(qstndetail);
    return qstn.save();
}

function answerCreate(text, ans_by, ans_date_time, comments) {
  answerdetail = {
    text: text,
    ans_By: ans_by
  };
  if (ans_date_time != false) answerdetail.ans_date_time = ans_date_time;
  if (comments != false) {
    answerdetail.comments = comments;
  }
  let answer = new Answer(answerdetail);

  return answer.save();
}

function tagCreate(name) {
    let tag = new Tag({ name: name });
    return tag.save();
}

function userCreate(username, password, email, admin, rep) {
    userdetail = {
      username: username,
      password: password,
      email: email,
      admin: admin,
      rep: rep
    }
    let user = new User(userdetail)
    return user.save();
}

function commentCreate(text, ans_by) {
  answerdetail = {
    text: text,
    ans_By: ans_by,
    upVotes: []
  };

  let comment = new Comment(answerdetail);
  return comment.save();
}

const Rounds = 10;
const hashedPass = bcrypt.hashSync(adminPassword, Rounds);
const hashedPass2 = bcrypt.hashSync("hello", Rounds);

const populate = async () => {
  let user1 = await userCreate('AliceSmith', hashedPass2, 'alicesmith@gmail.com', true, 30);
  let user2 = await userCreate('BobJohnson', hashedPass, 'bjohnson@gmail.com', true, 60);
  let user3 = await userCreate('CharlieBrown', hashedPass2, 'charliebrown@gmail.com', true, 25);

  let tag1 = await tagCreate('node.js');
  let tag2 = await tagCreate('python');
  let tag3 = await tagCreate('machine-learning');
  let tag4 = await tagCreate('mongodb');

  let comment1 = await commentCreate('Thanks for the detailed explanation!', user1);
  let comment2 = await commentCreate('I have a similar problem, can you help me?', user2);

  let answer1 = await answerCreate('Node.js is a JavaScript runtime built on Chrome\'s V8 JavaScript engine.', user1, false, [comment2]);
  let answer2 = await answerCreate('To install Python, you can use the official installer from the Python Software Foundation website.', user2, false);

  let answer3 = await answerCreate('Machine learning is a subset of artificial intelligence that focuses on building systems that learn from data.', user1, false);
  let answer4 = await answerCreate('MongoDB is a NoSQL database that provides high performance, high availability, and easy scalability.', user3, false);

  let answer5 = await answerCreate('You can use the npm package "express" to create a web server in Node.js.', user2, false);
  let answer6 = await answerCreate('In Python, you can use the pandas library for data manipulation and analysis.', user3, false);

  await questionCreate('Getting started with Node.js', 'I\'m new to Node.js and need guidance on how to get started.', [tag1, tag2], [answer1, answer5], user1, false, false, [comment1]);
  
  await questionCreate('Python installation', 'What is the recommended way to install Python on Windows?', [tag2, tag4], [answer2, answer6], user2, false, 67, false);

  await questionCreate('Introduction to Machine Learning', 'Can someone provide a simple explanation of what machine learning is?', [tag3, tag1], [answer3], user1, false, false);

  await questionCreate('MongoDB best practices', 'What are some best practices for optimizing MongoDB performance?', [tag4], [answer4], user3, false, 82, false);

  if (db) db.close();
}

populate()
  .then(() => {
    console.log('Database populated successfully.');
  })
  .catch((err) => {
    console.error('ERROR: ' + err);
  })
  .finally(() => {
    if (db) {
      db.close();
    }
  });

  //node init.js david mongodb://localhost:27017/fake_so