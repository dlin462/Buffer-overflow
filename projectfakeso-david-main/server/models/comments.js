const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: {type: String},
    ans_By: {type: mongoose.Schema.Types.ObjectId, ref:'Users'},
    upVotesComments: [{ type: mongoose.Schema.Types.ObjectId, ref:'Users'}]
});

commentSchema.virtual('url').get(function(){
    return '/posts/comments/' + this._id;
});

const Comments = mongoose.model('Comment', commentSchema);

module.exports = Comments;