//dynamic page-links generating
//how to access assets directory (images, font-awesome)
//how to register placeholder for failed GETS

$(document).ready(requestData(1));

function requestData(pageIndex) { 
  $.ajax({
    url: "/api/retrieveTweets/abcd",
    type: "GET",
    data: {
      page: pageIndex
    },
    success: function(response) {
      displayAll(response['statuses']);
      displayMostRT(response['statuses']);
      displayMostFollowers(response['statuses']);
    }
    //error
  })
}
function displayMostRT(status) {
    rtDiv = '<div class="sm-label">Most Retweeted</div><br/>'
    $('.most-rt').append(rtDiv);
}
function displayMostFollowers(status) {
    followDiv = '<div class="sm-label">Most Followers</div><br/>'
    $('.most-follow').append(followDiv);
}
function displayTweet(status) {

    profileImg = status['user']['profile_image_url'];
    profileImgDiv = '<span><img class="profile-img" src="'+profileImg+ '"/></span>';
    profileHandle = status['user']['screen_name'];
    profileHandleUrlSpan = '<span class="handle"><a href="http://twitter.com/@'+profileHandle+'">@'+profileHandle+'</a></span>';
    profileName = status['user']['name'];
    tweetDate = status['created_at'].split(' ')[1]+' '+status['created_at'].split(' ')[2];
    tweetDateSpan = '<span class="tweet-date">'+tweetDate+'</span>';
    tweetLoc = status['user']['location'];
    tweetLocSpan = '<span class="tweet-loc">'+tweetLoc+'</span>';
    
    favesSpan = '<span class="num-faves">'+status['favorite_count']+'</span>';
    rts = '<span class="num-rts">'+status['retweet_count']+'</span>';
    favorited = status['favorited'];
    var faveSpan = '';
    rt = status['retweeted'];
    var rtSpan = '';
    if(favorited) {
      faveSpan = '<span class="favestar"></span>';
    }
    if (rt) {
      rtSpan = '<span class="retweeted"></span>';
    }
    action = '<span class="action">'+faveSpan+' '+favesSpan+' <i class="fa fa-star"></i> '+rtSpan+' '+rts+' <i class="fa fa-retweet"></i></span>';
    profileDiv = '<div class="profile">'+profileName+' '+profileHandleUrlSpan+' '+tweetDateSpan+' '+tweetLocSpan+action+'</div>';

    tweetTxt = status['text'];

    var twre = /\@([a-z]+)/ig;
    var twhash = /\#([a-z]+)/ig;
    var twurl = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    var newTxt = tweetTxt.replace(twurl, '<a href="$1">$1</a>')
                         .replace(twre, '<a href="http://twitter.com/@$1">@$1</a>')
                         .replace(twhash, '<a href="http://search.twitter.com/search?q=$1">#$1</a>');

    tweetDiv = '<div class="tweet">'+profileImgDiv+profileDiv+newTxt+'</div><br/>'
    $('.tweet-container').append(tweetDiv);

}

function displayAll(statuses) {
    for(var i = 0; i< statuses.length; i++) {
        displayTweet(statuses[i]);
    }

}
function postTweet() {
  $.ajax({
    type: "post",
    url:"/api/posttweet",
    data: {
      username: "first last",
      message: "hello"
    },
    success: function(){
      debugger;
    }
  })
}