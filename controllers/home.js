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
            // console.log(results);
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
					// console.log(result);
				postObj.title = result.title;
				postObj.description = result.description;
				postObj.expandedUrl = result.expandedUrl;
				// console.log(i++,result.media);
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
Post.find({},null,{limit:6,sort:{date:-1}},function(err,latestPosts){
	Post.find({},null,{limit:6,sort:{likes:-1,dislikes:1}},function(err,topPosts){
		if(req.user){
			var userId = req.user._id;	
		}
		else{
			var userId = "";
		}
		// console.log('userId',userId)
		var latestPostsData = [];
		var topPostsData = []
		// console.log('latestPosts',latestPosts)
		if(latestPosts && latestPosts.length){
			async.forEachOfSeries(latestPosts,function(latestPost,index,latestPostCallback){
				// console.log('latestPost',latestPost);
				latestPostsData.push(formatPost(latestPost,userId))
				latestPostCallback();
			},function(err){
				if(err)
					console.log("Error while fetching latestPosts")
				else{
					async.forEachOfSeries(topPosts,function(topPost,index,topPostCallback){
						// console.log('topPost',topPost);
						topPostsData.push(formatPost(topPost,userId))
						topPostCallback();
					},function(err){
						if(err)
							console.log("Error while fetching latestPosts")
						else{
							if(latestPosts.length = 6){
								[latestPosts[2],latestPosts[3],latestPosts[4],latestPosts[5]] = [latestPosts[3],latestPosts[5],latestPosts[2],latestPosts[4]];
								[topPosts[2],topPosts[3],topPosts[4],topPosts[5]] = [topPosts[3],topPosts[5],topPosts[2],topPosts[4]]

							}
							res.render('home', {
							    title: 'Home',
							    latestPosts:latestPostsData,
							    topPosts:topPostsData,
							    communityPage:false
							})
						}
					})
				}
			})
		}else{
			{	res.render('home', {
			    title: 'Home',
			    latestPosts:[],
			    topPosts:[],
			    communityPage:false
				})
			}
		}
	})
	
})
};

function formatPost(post,userId){
	var postObj = {};
	postObj.likeFlag = false;
	postObj.dislikeFlag = false;
	postObj._id = post._id;
	postObj.postText = post.postText;
	postObj.likes = post.likes;
	postObj.dislikes = post.dislikes;
	postObj.mediaType = post.mediaType;
	postObj.videoObj = post.videoObj;
	postObj.imageSrc = post.imageSrc;
	postObj.media = post.mediaFlag;
	postObj.videoFlag = post.videoFlag;
	postObj.url = post.url;
	postObj.linkTitle = post.linkTitle;
	if(post.community)
		postObj.community = post.community.toUpperCase();
	if(post.linkDescription && post.linkDescription.length>150){
		var breakPoint = post.linkDescription.slice(0,150).lastIndexOf(' ');
		postObj.linkDescription = post.linkDescription.slice(0,breakPoint) + '...';
	}
	else
		postObj.linkDescription = post.linkDescription;
	if(!postObj.videoFlag)
		postObj.imageFlag = post.imageFlag;
	// console.log("temp after appending");
	if(post.likeVotes.indexOf(userId) != -1)
		postObj.likeFlag = true;
	if(post.dislikeVotes.indexOf(userId) != -1)
		postObj.dislikeFlag = true;
	return postObj;
}
