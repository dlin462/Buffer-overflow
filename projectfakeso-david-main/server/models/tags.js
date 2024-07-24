const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
    name: {type: String},
});

tagSchema.virtual('url').get(function(){
    return '/posts/tag/' + this._id;
});

const Tags = mongoose.model('Tags', tagSchema);

module.exports = Tags;