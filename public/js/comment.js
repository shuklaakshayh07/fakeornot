var host = window.location.host; 
var socket = io('ws://'+host, {transports: ['websocket']});

$(document).ready(function(){
	var postId = $('.commentBlock_container').attr("data-id");
	socket.on('newComment:'+postId, function(data){
		var newDiv = '<div class="commentDiv" data-id="'+data._id+'"><div class="commentUser"><i class="fa fa-user" aria-hidden="true"></i><span class="userName" style="font-weight:bold;">'+data.userName+'</span></div><div class="commentText" style="margin-left:20px">'+data.comment_text+ '</div></div>';
		$('.commentSectionDiv').append(newDiv);
	});


	$('.btn-raised').click(function(event){
		console.log("submit clicked");
		var comment_value = $('.addComment').val();
		console.log(comment_value);
		var commentObj = {};
		commentObj.parent_postId = $(this).attr("data-id");
		commentObj.comment_text = comment_value;
		console.log("commentObj",commentObj);
		$.post("/addComment",commentObj,function(data, status){
			alert("Data: " + data);
			});
	})

	$('.deleteComment').click(function(event){
		console.log("comment delete icon clicked");
		var _this = this;
		var commentId = $(this).attr("data-id");
		var postId = $(this).closest('.commentBlock_container').attr("data-id");
		$.get('/deleteComment/'+commentId,function(status){ console.log("status",status);
			if(status)
				{	console.log($(_this).closest('.commentDiv').attr("data-id"));
					$(_this).closest('.commentDiv').addClass("d-none");
				}
		})
	})
});