const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
	postText: String, 
	date: Date,
	likes: Number,
	dislikes: Number,
	userId: String,
	likeVotes : [String],
	dislikeVotes : [String],
	url: String,
	mediaType: String,
	videoObj: {
				title:String,
				src: String,
			  },
	imageSrc: String,
	mediaFlag: Boolean,
	videoFlag: Boolean,
	imageFlag: Boolean,
	linkDescription : String,
	linkTitle: String,
	community: String
});

const Post = mongoose.model('Post', postSchema);


module.exports = Post;