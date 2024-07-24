const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {type: String},
    password: {type: String},
    email: {type: String},
    admin: {type: Boolean, default: false},
    rep: {type: Number, default: 0},
    join_date: {type: Date, default: new Date()}
});

userSchema.virtual('url').get(function(){
    return '/posts/user/' + this._id;
});

const Users = mongoose.model('User', userSchema);

module.exports = Users;