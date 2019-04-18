/**
 * GET /
 * Home page.
 */
const Post = require('../models/Post.js');
var mongoose = require('mongoose');
var http = require('http');
var url_regex = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/gi;
var getUrls = require('get-urls');
var async = require('async');

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
            console.log(results);
            callback(results);
        });
    });
    req.end();
};
var i = 1;
var process_preview = function(postObjects, funccallback){
	async.forEach(postObjects,function(postObj,callback){
		if(postObj.url){
			get_preview("https://www.youtube.com/watch?v=kcKQI0J6pmU",function(result){
					console.log(result);
				postObj.title = result.title;
				postObj.description = result.description;
				postObj.expandedUrl = result.expandedUrl;
				console.log(i++,result.media);
				result.media.forEach(function(media){
					if(media.type == video){
						postObj.video = {};
						postObj.video.title = media.title;
						postObj.video.src = media.src;
					}
					if(media.type == image){
						postObj.image = {};
						postObj.image.src = media.src;
					}
				})
			})
		}
	},function(finalPostArr){
		funccallback(finalPostArr);
	});
}

exports.index = (req, res) => {
Post.find({},function(err,result){
	// if(result.length == 0)
	// 	console.log('entered if');
	// 	{	res.render('home', {
	// 	    title: 'Home',
	// 	    posts:[]
	// 		})
	// 	}
	if(req.user){
		var userId = req.user._id;	
	}
	else{
		var userId = "";
	}
	console.log('userId',userId)
	var i = 0;
	var finalResult = [];
	console.log('result',result)
	if(result && result.length){
		result.forEach(function(obj){
			console.log('obj',obj)
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
			if(obj.community)
				postObj.community = obj.community.toUpperCase();
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
			finalResult.push(postObj);
			if(i == result.length)
			{	res.render('home', {
			    title: 'Home',
			    posts:finalResult,
			    communityPage:false
				})
			}
		})
	}else{
		{	res.render('home', {
		    title: 'Home',
		    posts:[],
		    communityPage:false
			})
		}
	}
})
};
