const express = require('express');
const session = require('express-session');
const MongoStore = require("connect-mongo");
const bcrypt = require('bcrypt');
const app = express();
var cors = require('cors')
const port = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }))

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:8000'],
  methods: ['POST', 'GET', 'PUT', 'POST', 'DELETE'],
  credentials: true
};

let Answers = require('./models/answers.js');
const Questions = require('./models/questions.js');
let Tags = require('./models/tags.js');
let Users = require('./models/users.js');
let Comments = require('./models/comments.js')


let mongoose = require('mongoose');
let mongoDB = "mongodb://127.0.0.1/fake_so";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;


const sessionStore = new MongoStore({
  mongoUrl: mongoDB, 
  collection: 'sessions', 
});

app.use(
  session({
    secret: 'my-secret-key',
    cookie: {},
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);
app.listen(port, () => {
  console.log(`Fake SO listening on port ${port}`)
})

// app.post('/newQuestions', async (req,res) => {

//   const newQuestion = new Questions({
//     title: req.body.title,
//     text: req.body.text,
//     tags: req.body.tags,
//     answers: req.body.answers,
//     asked_by: req.body.asked_by,
//     ask_date_time: req.body.ask_date_time,
//     views: req.body.views
//   });

//   await newQuestion.save();
//   res.send("created new question");
// })

// app.post('/newAnswers', async (req,res) => {
//   const newAnswer = new Answers({
//     text: req.body.text,
//     ans_By: req.body.ans_By,
//     ans_date_time: req.body.ans_date_time
//   });
//   await newAnswer.save();
//   res.send("created new answer");
// })

// app.post('/newTags', async (req,res) => {
//   const newTag = new Tags({
//     name: req.body.name
//   });
//   await newTag.save();
//   res.send("created new tag");
// })

// app.put('/questions/:id', async (req, res) => {
//   const id = req.params.id;
//   try {
//     const question = await Questions.findOne({ _id: id });
//     if (!question) {
//       return res.status(404).send('Question not found');
//     }
//     if(req.body.views != null){
//       question.views = req.body.views;
//     }
    
//     if(req.body.answers != null){
//       question.answers = req.body.answers;
//     }
//     await question.save();
//     res.send('Question updated');
//   } catch (error) {
//     res.status(500).send('Internal server error');
//   }
// });
// });

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

db.on('connected', function () {
  app.use(cors(corsOptions));
  app.get('/questions', async (req, res) => {
    let questions = await Questions.find().sort({ ask_date_time: 1 })
    console.log(questions);
    res.send(questions)
  })

  app.get('/answers', async (req, res) => {
    let answers = await Answers.find().sort({ ans_date_time: 1 })
    res.send(answers)
  })

  app.get('/tags', async (req, res) => {
    let tags = await Tags.find({}).sort({ name: 1 })
    res.send(tags);
  })

  app.get('/users', async (req, res) => {
    let users = await Users.find({}).sort({ name: 1 })
    res.send(users);
  })

  app.get('/comments', async (req, res) => {
    let comments = await Comments.find({}).sort({ name: 1 })
    res.send(comments);
  })

  app.post('/newQuestions', async (req, res) => {
    const newQuestion = new Questions({
      title: req.body.title,
      text: req.body.text,
      tags: req.body.tags,
      answers: req.body.answers,
      asked_by: req.body.asked_by,
      ask_date_time: req.body.ask_date_time,
      views: req.body.views,
      upVotes: req.body.upVotes,
      downVotes: req.body.downVotes,
      comments: [],
      sum: req.body.sum
    });
    await newQuestion.save();
    res.send("success");
  })

  app.post('/newTags', async (req, res) => {
    const newTag = new Tags({
      name: req.body.name
    });
  
    try {
      await newTag.save();
      res.json(newTag);
    } catch (error) {
      console.error(error);
      res.status(500).send("error");
    }
  });

  app.post('/newUsers', async (req, res) => {
    let password = req.body.password;
    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        console.error(err);
      } else {
        const newUser = new Users({
          username: req.body.username,
          password: hash,
          email: req.body.email
        });

        await newUser.save();
        res.send('success');
      }
    });

  })

  app.post('/newAnswers', async (req, res) => {
    const newAnswer = new Answers({
      text: req.body.text,
      ans_By: req.body.ans_By,
      ans_date_time: req.body.ans_date_time,
      upVotesAns: [],
      downVotesAns: [],
      comments: []
    });
    await newAnswer.save();
    res.send(newAnswer);
  })

  app.post('/newComments', async (req, res) => {
    const newComments = new Comments({
      text: req.body.text,
      ans_By: req.body.ans_By,
      upVotesComments: []

    });
    await newComments.save();
    res.send(newComments);
  })

  app.put('/questions/:id', async (req, res) => {
    const id = req.params.id;
    try {
      const question = await Questions.findOne({ _id: id });
      if (!question) {
        return res.status(404).send('error');
      }
      if (req.body.views != null) {
        question.views = req.body.views;
      }

      if (req.body.answers != null) {
        question.answers = req.body.answers;
      }

      if (req.body.upVotes != null) {
        question.upVotes = req.body.upVotes;
      }

      if (req.body.downVotes != null) {
        question.downVotes = req.body.downVotes;
      }

      if (req.body.comments != null) {
        question.comments = req.body.comments;
      }

      if (req.body.title != null) {
        question.title = req.body.title;
      }

      if (req.body.text != null) {
        question.text = req.body.text;
      }

      if (req.body.tags != null) {
        question.tags = req.body.tags;
      }

      if (req.body.sum != null) {
        question.sum = req.body.sum;
      }

      await question.save();
      res.send('updated');
    } catch (error) {
      console.log(error);
      res.status(500).send('error');
    }
  });

  app.put('/answers/:id', async (req, res) => {
    const id = req.params.id;
    try {
      const answer = await Answers.findOne({ _id: id });
      if (!answer) {
        return res.status(404).send('error');
      }
      if (req.body.upVotesAns != null) {
        answer.upVotesAns = req.body.upVotesAns;
      }
      if (req.body.downVotesAns != null) {
        answer.downVotesAns = req.body.downVotesAns;
      }
      if (req.body.comments != null) {
        answer.comments = req.body.comments;
      }
      if (req.body.text != null) {
        answer.text = req.body.text;
      }


      await answer.save();
      res.send('saved');
    } catch (error) {
      console.log(error);
      res.status(500).send('error');
    }
  });

  app.put('/comments/:id', async (req, res) => {
    const id = req.params.id;
    try {
      const comment = await Comments.findOne({ _id: id });
      if (!comment) {
        return res.status(404).send('error');
      }

      if (req.body.upVotesComments != null) {
        comment.upVotesComments = req.body.comments;
      }

      await comment.save();
      res.send('saved');
    } catch (error) {
      console.log(error);
      res.status(500).send('error');
    }
  });

  app.put('/users/:id', async (req, res) => {
    const id = req.params.id;
    try {
      const user = await Users.findOne({ _id: id });
      if (!user) {
        return res.status(404).send('error');
      }

      if (req.body.rep != null) {
        user.rep = req.body.rep;
      }


      await user.save();
      res.send('User updated');
    } catch (error) {
      console.log(error);
      res.status(500).send('error');
    }
  });

  app.put('/tags/:id', async (req, res) => {
    const id = req.params.id;
    try {
      const tag = await Tags.findOne({ _id: id });
      if (!tag) {
        return res.status(404).send('error');
      }
      if (req.body.name != null) {
        tag.name = req.body.name;
      }

      await tag.save();
      res.send('Tag updated');
    } catch (error) {
      console.log(error);
      res.status(500).send('error');
    }
  });


  app.delete('/questions/delete/:id', async (req, res) => {
    try {
      const deletedQuestion = await Questions.findByIdAndDelete(req.params.id);
      if (!deletedQuestion) {
        return res.status(404).send('Question not found');
      }
      res.send('success');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
    }
  });

  app.delete('/answers/delete/:id', async (req, res) => {
    try {
      const deletedAnswer = await Answers.findByIdAndDelete(req.params.id);
      if (!deletedAnswer) {
        return res.status(404).send('Question not found');
      }
      res.send('success');
    } catch (error) {
      console.error(error);
      res.status(500).send('error');
    }
  });

  app.delete('/comments/delete/:id', async (req, res) => {
    try {
      const deletedComment = await Comments.findByIdAndDelete(req.params.id);
      if (!deletedComment) {
        return res.status(404).send('Question not found');
      }
      res.send('success');
    } catch (error) {
      console.error(error);
      res.status(500).send('error');
    }
  });

  app.delete('/tags/delete/:id', async (req, res) => {
    try {
      const deletedTag = await Tags.findByIdAndDelete(req.params.id);
      if (!deletedTag) {
        return res.status(404).send('Tag not found');
      }
      res.send('success');
    } catch (error) {
      console.error(error);
      res.status(500).send('error');
    }
  });

  app.delete('/users/delete/:id', async (req, res) => {
    try {
      const deletedUser = await Users.findByIdAndDelete(req.params.id);
      if (!deletedUser) {
        return res.status(404).send('User not found');
      }
      res.send('deleted');
    } catch (error) {
      console.error(error);
      res.status(500).send('error');
    }
  });

  app.post('/login', async (req, res) => {
    const { email, password, storedHash } = req.body;
  
    const user = await Users.findOne({ email });
  
    if (!user) {
      return res.status(401).send('Invalid credentials');
    }
  
    try {
      const passwordMatch = await bcrypt.compare(password, storedHash);
  
      if (passwordMatch) {
        req.session.userId = user._id;
        req.session.username = user.username;
        req.session.admin = user.admin;
  
        res.cookie('connect.sid', req.sessionID, { httpOnly: true, secure: true });
        res.send(user);
      } else {
        res.status(401).send('Invalid credentials');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
    }
  });

  app.post('/logout', (req, res) => {
    sessionStore.destroy((err) => {
      if (err) {
        console.error(err);
      } else {
        res.send('success');
      }
    });
  });

  app.get('/session', (req, res) => {
    const sessionId = req.sessionID;
    sessionStore.get(sessionId, (err, session) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error');
      } else {
        res.send(session);
      }
    });
  });

});