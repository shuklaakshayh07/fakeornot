
const Post = require('../models/Post.js');
var mongoose = require('mongoose');
var getUrls = require('get-urls');
var async = require('async');
var http = require('http');
const uniqid = require('uniqid');
var get_preview = function(url, callback) {
    var options = {
        hostname: '54.244.251.242',
        port: '8090',
        path: '/stories/link_preview.json?link=' + url ,
        method: 'GET'
    };
    var results = '';
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            results = results + chunk;
        });
        res.on('end', function () {
            console.log("result",results);
            callback(results);
        });
    });
    req.end();
};

exports.addPost = (req,res)=>{
	console.log(req.body);
	var postObj = req.body;
	var userId = req.user._id;
	postObj.mediaFlag = false;
	var urlSet = getUrls(req.body.post_text);
	var getUrl = urlSet[Symbol.iterator]();
	postObj.url = getUrl.next().value;
	postObj.userId = userId;
	if(urlSet.size == 0){
		addPostToDb(req,res,postObj);
	}
	else{
		get_preview(postObj.url,function(result){
			result = JSON.parse(result).preview;
			postObj.title = result.title;
			postObj.description = result.description;
			postObj.expandedUrl = result.expandedURL;
			var i = 0;
			result.media.forEach(function(media){
				if(media.type == 'video'){
					postObj.video = {};
					postObj.video.title = media.title;
					postObj.video.src = media.src;
					postObj.mediaType = "video";
					postObj.mediaFlag = true;
					postObj.videoFlag = true;
				}
				if(media.type == 'image' || media.type == 'photo'){
					postObj.image = media.src;
					postObj.mediaType = "image"
					postObj.mediaFlag = true;
					postObj.imageFlag = true;
				}
				i++;
				if(i == result.media.length){
					console.log(postObj);
					addPostToDb(req,res,postObj);
					}
			});
		});
	}
};

var addPostToDb = (req,res,postObj)=>{
	console.log("in callback");
			var newPost = new Post({
				_id: uniqid(),
				postText: req.body.post_text, 
				date: Date.now(),
				likes: 0,
				dislikes: 0,
				userId: postObj.userId,
				url: postObj.url,
				mediaType: postObj.mediaType,
				videoObj: postObj.video,
				imageSrc: postObj.image,
				mediaFlag: postObj.mediaFlag,
				videoFlag: postObj.videoFlag,
				imageFlag: postObj.imageFlag,
				linkTitle: postObj.title,
				linkDescription: postObj.description,
				community: postObj.community
			});
			newPost.save(function(res){
			console.log("Post saved");
			});
		res.send('post has been succesfully posted');
};


exports.likePost = (req,res)=>{
		console.log(req.user._id);
		var userId = req.user._id;
		var postId = req.body.postId;
		var curr_status = true;
		var data = {};
		data["like"] = true;
		data["dislike"] = false;
		data["prev_type"] = 0;
		Post.findOne({_id:postId},function(err,obj){console.log()
			if(obj.dislikeVotes.indexOf(userId) != -1){
				Post.update({_id:postId},{ $inc: {dislikes:-1},$pull:{dislikeVotes:userId}},function(err,resp){
					console.log("right block",resp);
					data["dislike"] = false;
					data["like"] = false;
					data["prev_type"] = -1; 
					res.send(data);
				});
			}
			else if(obj.likeVotes.indexOf(userId) != -1){
				Post.update({_id:postId},{ $inc: {likes:-1},$pull:{likeVotes:userId}},function(err){
					console.log("updated unlike");
					data["prev_type"] = 1;
					data["dislike"] = false;
					data["like"] = true;
					res.send(data);
				});
			}
			else{
				Post.update({_id:postId},{ $inc: {likes:1},$push:{likeVotes:userId}},function(err){
					console.log("updated like");
					res.send(data);
				})	
			}
		})
		console.log(userId,req.body.postId);
};

exports.dislikePost = (req,res)=>{
		console.log(req);
		var userId = req.user._id;
		var postId = req.body.postId;
		var curr_status = true;
		var data = {};
		data["like"] = false;
		data["dislike"] = true;
		data["prev_type"] = 0;
		Post.findOne({_id:postId},function(err,obj){
			if(obj.likeVotes.indexOf(userId) != -1){console.log("in 1st if");
				Post.update({_id:postId},{ $inc: {likes:-1},$pull:{likeVotes:userId}},function(err){
					console.log("in process");
					data["dislike"] = false;
					data["like"] = false;
					data["prev_type"] = 1; 
					res.send(data);
				});
			}
			else if(obj.dislikeVotes.indexOf(userId) != -1){
				Post.update({_id:postId},{ $inc: {dislikes:-1},$pull:{dislikeVotes:userId}},function(err){
					console.log("updated un-dislike");
					data["dislike"] = true;
					data["like"] = false;
					data["prev_type"] = -1;
					res.send(data);
				});
			}
			else{
				Post.update({_id:postId},{ $inc: {dislikes:1},$push:{dislikeVotes:userId}},function(err){
					console.log("updated dislike");
					res.send(data);
				})	
			}
		})
};
exports.searchPost = (req,res)=>{
	console.log("in search",req);
	var searchQuery = req.body.search_value;
	var userId = req.user._id;
	Post.find({$text: { $search: searchQuery}},function(err,result){
		console.log("result",result);
		if(err)
			console.log("error in fetching post");
		else{
			if(result.length == 0)
				{console.log("no post found");
				 res.render('noResult');
				}
			else{
				console.log(result);
					var i = 0;
					var finalResult = [];
					result.forEach(function(obj){
						i++;
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
						postObj.community = obj.community
						if(obj.linkDescription && obj.linkDescription.length>150)
							postObj.linkDescription = obj.linkDescription.slice(0,147)+"....";
						else
							postObj.linkDescription = obj.linkDescription;
						if(!postObj.videoFlag)
							postObj.imageFlag = obj.imageFlag;
						console.log("temp after appending");
						if(obj.likeVotes.indexOf(userId) != -1)
							postObj.likeFlag = true;
						if(obj.dislikeVotes.indexOf(userId) != -1)
							postObj.dislikeFlag = true;
						console.log("while render ",postObj);
						finalResult.push(postObj);
						if(i == result.length)
						{	res.render('home', {
						    title: 'Home',
						    posts:finalResult,
		    				communityPage:true
							})
						}
					})
				}
			}
	})
}
exports.getCommunityPost = (req,res)=>{
	var url = req.url;
	var index = url.lastIndexOf('/');
	var community = url.slice(index + 1);
	var userId = req.user._id;
	console.log(community);
	Post.find({community:community},function(err,result){
		if(err)
			console.log("error in fetching post");
		else{
			if(result.length == 0)
				console.log("no post found");
			else{
				console.log(result);
					var i = 0;
					var finalResult = [];
					result.forEach(function(obj){
						i++;
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
						if(obj.linkDescription && obj.linkDescription.length>150)
							postObj.linkDescription = obj.linkDescription.slice(0,147)+"....";
						else
							postObj.linkDescription = obj.linkDescription;
						if(!postObj.videoFlag)
							postObj.imageFlag = obj.imageFlag;
						console.log("temp after appending");
						if(obj.likeVotes.indexOf(userId) != -1)
							postObj.likeFlag = true;
						if(obj.dislikeVotes.indexOf(userId) != -1)
							postObj.dislikeFlag = true;
						console.log("while render ",postObj);
						finalResult.push(postObj);
						if(i == result.length)
						{	res.render('home', {
						    title: 'Home',
						    posts:finalResult,
		    				communityPage:true
							})
						}
					})
				}
			}
	})
}

exports.showUserPost = (req,res)=>{
		// console.log(req);
		var userId = req.user._id;
		console.log("in show user route",userId);
		Post.find({userId:userId},function(err,result){
			if(err)
				console.log("error in fetching post");
			else{
				if(result.length == 0)
					console.log("no post found");
				else{
					console.log(result);
					var i = 0;
					var finalResult = [];
					result.forEach(function(obj){
						i++;
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
						postObj.community = obj.community;
						if(obj.linkDescription && obj.linkDescription.length>150)
							postObj.linkDescription = obj.linkDescription.slice(0,147)+"....";
						else
							postObj.linkDescription = obj.linkDescription;
						if(!postObj.videoFlag)
							postObj.imageFlag = obj.imageFlag;
						console.log("temp after appending");
						if(obj.likeVotes.indexOf(userId) != -1)
							postObj.likeFlag = true;
						if(obj.dislikeVotes.indexOf(userId) != -1)
							postObj.dislikeFlag = true;
						console.log("while render ",postObj);
						finalResult.push(postObj);
						if(i == result.length)
						{	res.render('home', {
						    title: 'Home',
						    posts:finalResult,
		    				communityPage:false
							})
						}
					})
				}
			}
		})
}