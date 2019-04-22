const Post = require('../models/Post.js');
const Comment =  require('../models/Comment.js')
var mongoose = require('mongoose');
var http = require('http');
var url_regex = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/gi;
var getUrls = require('get-urls');
var async = require('async');
const uniqid = require('uniqid');

exports.commentPage = (req,res) =>{
	var url = req.url;
	var userId = "";
	if(req.user)
		userId = req.user._id;
	var postId = url.slice(url.lastIndexOf('/')+1);
	var post = Post.find({_id:postId},function(err,response){
		var obj = response[0];
		var postObj = {};
		postObj.likeFlag = false;
		postObj.dislikeFlag = false;
		postObj._id = obj._id;
		postObj.postText = obj.postText;
		postObj.likes = obj.likes;
		postObj.dislikes = obj.dislikes;
		postObj.mediaType = obj.mediaType;
		postObj.videoObj = obj.videoObj;
		postObj.imageSrc = obj.imageSrc;
		postObj.media = obj.mediaFlag;
		postObj.videoFlag = obj.videoFlag;
		postObj.url = obj.url;
		postObj.linkTitle = obj.linkTitle;
		if(obj.community)
			postObj.community = obj.community.toUpperCase();
		if(obj.linkDescription && obj.linkDescription.length>150)
			postObj.linkDescription = obj.linkDescription.slice(0,147)+"....";
		else
			postObj.linkDescription = obj.linkDescription;
		if(!postObj.videoFlag)
			postObj.imageFlag = obj.imageFlag;
		if(obj.likeVotes.indexOf(userId) != -1)
			postObj.likeFlag = true;
		if(obj.dislikeVotes.indexOf(userId) != -1)
			postObj.dislikeFlag = true;
		var comments = Comment.find({parentPostId:postId},function(err,commentRes){
			res.render('comment', {
		    title: 'comment',
		    post:postObj,
		    comments:commentRes
			})

		})
	})
	// res.send('home');
}

exports.deleteComment = (req,res) =>{
	// console.log(req);
	var url = req.url;
	var userId = req.user._id;
	var commentId = url.slice(url.lastIndexOf('/')+1);
	Comment.deleteOne({$and:[{_id:commentId},{userId:userId}]},function(err){
		if(err){
			console.log("cant be deleted");
			res.send(false);
		}
		else{
			res.send(true);
			}
	})
}

exports.addComment = (req,res,callback) =>{
	var userId = req.user._id;
	var userName = req.user.profile.name;
	var comment_text = req.body.comment_text;
	var comment = {};
	var id = uniqid();
	var newComment = new Comment({
		_id:id,
		comment_text:req.body.comment_text,
		userId:userId,
		time:Date.now(),
		userName:userName,
		parentPostId:req.body.parent_postId

	})
	newComment.save(function(response){
		callback(newComment);
	})

}

