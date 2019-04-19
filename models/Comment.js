const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
	parentPostId: String,
	comment_text: String,
	userName: String,
	userId: String,
	date: Date
},);

const Comment = mongoose.model('Comment',commentSchema);

module.exports = Comment;