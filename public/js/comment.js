$(document).ready(function(){
	console.log("comment Page ready");

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
		console.log("postId",postId);
		$.get('/deleteComment/'+commentId,function(status){ console.log("status",status);
			if(status)
				{	console.log($(_this).closest('.commentDiv').attr("data-id"));
					$(_this).closest('.commentDiv').addClass("d-none");
				}
		})
	})
});