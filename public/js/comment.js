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
});