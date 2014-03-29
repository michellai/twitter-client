//dynamic page-links generating
//how to access assets directory (images, font-awesome)
//how to register placeholder for failed GETS

$(document).ready(
  function() {
    window.pageNum = 1;
    requestData(window.pageNum);
    displayMostRT();
    displayMostFollowers();

  }
);

$(window).scroll(function() {
  //debugger
  if (!$('body').hasClass('processing')) {
    if($(window).scrollTop() + $(window).height() >= .9*$(document).height()) {
      $('body').addClass('processing');
      requestData(1);
      console.log('ajax called');
    }
  }
});



function requestData() { 
  $.ajax({
    url: "/api/retrieveTweets/abcd",
    type: "GET",
    data: {
      page: window.pageNum
    },
    success: function(response) {
      displayAll(response['statuses']);
      $('body').removeClass('processing');
      $("img").on('error', function() {
        $(this).attr('src', 'http://placekitten.com/52/52');
      });
      window.pageNum++;
    }

    //error
  })
}
function displayMostRT() {
    rtDiv = '<div class="sm-label">Most Retweeted</div><br/>'
    $('.most-rt').append(rtDiv);
}
function displayMostFollowers() {
    followDiv = '<div class="sm-label">Most Followers</div><br/>'
    $('.most-follow').append(followDiv);
}
function displayTweet(status) {
    tweetTxt = status['text'];

    var twre = /\@([a-z]+)/ig;
    var twhash = /\#([a-z]+)/ig;
    var twurl = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    var newTxt = tweetTxt.replace(twurl, '<a href="$1">$1</a>')
                         .replace(twre, '<a href="http://twitter.com/@$1">@$1</a>')
                         .replace(twhash, '<a href="http://search.twitter.com/search?q=$1">#$1</a>');
    status['text'] = newTxt;
    $('.list').append(JST.tweet({tweet:status}));

}

function displayAll(statuses) {
    var options = {
        valueNames: [ 'created', 'retweets', 'faves', 'followers', 'tweets' ]
    };

    var twList = new List('tweets', options);
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