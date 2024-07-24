const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    title: {type: String, required: true, maxLength:100},
    text: {type: String, required: true},
    sum: {type: String},
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref:'Tag'}],
    answers: [{ type: mongoose.Schema.Types.ObjectId, ref:'Answers'}],
    asked_by: {type: mongoose.Schema.Types.ObjectId, ref:'Users'},
    ask_date_time: {type: Date, default: new Date()},
    views: {type: Number, default: 0},
    upVotes: [{ type: mongoose.Schema.Types.ObjectId, ref:'Users'}],
    downVotes: [{ type: mongoose.Schema.Types.ObjectId, ref:'Users'}],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref:'Comments'}]
});

questionSchema.virtual('url').get(function(){
    return '/posts/question/' + this._id;
});

const Questions = mongoose.model('Question', questionSchema);

module.exports = Questions;
