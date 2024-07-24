const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    text: {type: String},
    ans_By: {type: mongoose.Schema.Types.ObjectId, ref:'Users'},
    ans_date_time:{type: Date, default: new Date()},
    upVotesAns: [{ type: mongoose.Schema.Types.ObjectId, ref:'Users'}],
    downVotesAns: [{ type: mongoose.Schema.Types.ObjectId, ref:'Users'}],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref:'Comments'}]
});
answerSchema.virtual('url').get(function(){
    return '/posts/answer/' + this._id;
});

const Answers = mongoose.model('Answer', answerSchema);

module.exports = Answers;