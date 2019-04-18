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

	$('.fa-thumbs-up').click(function(event){
		console.log("like",$(this).attr("data-id"));
		var postId = $(this).attr("data-id");
		var postMeta = {};
		postMeta["postId"] = postId;
		console.log("before calling like",postMeta);
		var likeCount = parseInt($('.block_container[data-id='+postId+']').find('.likeCount').html());
		var dislikeCount = parseInt($('.block_container[data-id='+postId+']').find('.dislikeCount').html());
		$.post("/posterActionLike",postMeta,function(data, status){ console.log("data",data);
			if(data['like'] && data["prev_type"]){console.log("1st");
				$('.block_container[data-id='+postId+']').find('.likeCount').html(likeCount-1);
				$('.block_container[data-id='+postId+']').find('.fa-thumbs-up').css('color','');	
			}
			else if(data["prev_type"] == -1){console.log("2nd");
				$('.block_container[data-id='+postId+']').find('.dislikeCount').html(dislikeCount-1);
				$('.block_container[data-id='+postId+']').find('.fa-thumbs-down').css('color','');
			}
			else if(data["like"]){console.log("3rd");
				$('.block_container[data-id='+postId+']').find('.likeCount').html(likeCount+1);
				$('.block_container[data-id='+postId+']').find('.fa-thumbs-up').css('color','#dbdbef');
			}
		});
	})

	$('.fa-thumbs-down').click(function(){
		// console.log("dislike",event);
		var postId = $(this).attr("data-id")
		var postMeta = {};
		postMeta["postId"] = postId;
		var dislikeCount = parseInt($('.block_container[data-id='+postId+']').find('.dislikeCount').html());
		var likeCount = parseInt($('.block_container[data-id='+postId+']').find('.likeCount').html());
		// $('.block_container[data-id='+postId+']').find('.dislikeCount').html(dislikeCount+1);
		$.post("/posterActionDislike",postMeta,function(data, status){
			if(data["dislike"] && data["prev_type"] == -1){
				$('.block_container[data-id='+postId+']').find('.dislikeCount').html(dislikeCount-1);
				$('.block_container[data-id='+postId+']').find('.fa-thumbs-down').css('color','');	
			}
			else if(data["prev_type"]){
				$('.block_container[data-id='+postId+']').find('.likeCount').html(likeCount-1);
				$('.block_container[data-id='+postId+']').find('.fa-thumbs-up').css('color','');
			}
			else if(data["dislike"]){
				$('.block_container[data-id='+postId+']').find('.dislikeCount').html(dislikeCount+1);
				$('.block_container[data-id='+postId+']').find('.fa-thumbs-down').css('color','red');
			}
		});
	})
	
});