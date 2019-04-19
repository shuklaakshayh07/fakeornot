$(document).ready(function(){
	console.log("ready");
	
	$('.postForm').submit(function(event){
		console.log("over here",event);
		var postObject = {};
		postObject['post_text'] = $('.fill-post').val();
		postObject['community'] = $('.communities').val();
		if(postObject['community'] == 'noValue')
			alert("please select a community");
		
		else{
		$.post("/poster",postObject,function(data, status){
			alert("Data: " + data);
			});
		}
	})
	
	$('.searchInput').click(function(event){
		console.log("submitted");
		console.log("search",$(".searchInput").val());
		if($(".searchInput").val() == "search in posts")
			$(".searchInput").val('');
	})

	$('.thumbUp').click(function(event){
		console.log("like",$(this).attr("data-id"));
		var postId = $(this).attr("data-id");
		var postMeta = {};
		postMeta["postId"] = postId;
		console.log("before calling like",postMeta);
		var likeCount = parseInt($('.card[data-id='+postId+']').find('.likeCount').html());
		var dislikeCount = parseInt($('.card[data-id='+postId+']').find('.dislikeCount').html());
		$.post("/posterActionLike",postMeta,function(data, status){ console.log("data",data);
			if(data["prev_type"] == 1){
				$('.card[data-id='+postId+']').find('.likeCount').html(likeCount-1);
				$('.card[data-id='+postId+']').find('.likeCount').removeClass('active');
				$('.card[data-id='+postId+']').find('.thumbUp').removeClass('active');	
			}
			else if(data["prev_type"] == -1){
				$('.card[data-id='+postId+']').find('.dislikeCount').html(dislikeCount-1);
				$('.card[data-id='+postId+']').find('.dislikeCount').removeClass('active');
				$('.card[data-id='+postId+']').find('.thumbDown').removeClass('active');
				$('.card[data-id='+postId+']').find('.likeCount').html(likeCount+1);
				$('.card[data-id='+postId+']').find('.likeCount').addClass('active');
				$('.card[data-id='+postId+']').find('.thumbUp').addClass('active');
			}
			else if(data["prev_type"] == 0){
				$('.card[data-id='+postId+']').find('.likeCount').html(likeCount+1);
				$('.card[data-id='+postId+']').find('.likeCount').addClass('active');
				$('.card[data-id='+postId+']').find('.thumbUp').addClass('active');
			}
		});
	})

	$('.fa-comments').click(function(){
		console.log("comments button clicked");
	})

	$('.thumbDown').click(function(){
		// console.log("dislike",event);
		var postId = $(this).attr("data-id")
		var postMeta = {};
		postMeta["postId"] = postId;
		var dislikeCount = parseInt($('.card[data-id='+postId+']').find('.dislikeCount').html());
		var likeCount = parseInt($('.card[data-id='+postId+']').find('.likeCount').html());
		$.post("/posterActionDislike",postMeta,function(data, status){
			if(data["prev_type"] == -1){
				$('.card[data-id='+postId+']').find('.dislikeCount').html(dislikeCount-1);
				$('.card[data-id='+postId+']').find('.dislikeCount').removeClass('active');
				$('.card[data-id='+postId+']').find('.thumbDown').removeClass('active');
			}
			else if(data["prev_type"] == 1){
				$('.card[data-id='+postId+']').find('.likeCount').html(likeCount-1);
				$('.card[data-id='+postId+']').find('.likeCount').removeClass('active');
				$('.card[data-id='+postId+']').find('.thumbUp').removeClass('active');
				$('.card[data-id='+postId+']').find('.dislikeCount').html(dislikeCount+1);
				$('.card[data-id='+postId+']').find('.dislikeCount').addClass('active');
				$('.card[data-id='+postId+']').find('.thumbDown').addClass('active');
			}
			else if(data["prev_type"] == 0){
				$('.card[data-id='+postId+']').find('.dislikeCount').html(dislikeCount+1);
				$('.card[data-id='+postId+']').find('.dislikeCount').addClass('active');
				$('.card[data-id='+postId+']').find('.thumbDown').addClass('active');
			}
		});
	})
	
});