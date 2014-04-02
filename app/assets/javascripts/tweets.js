//dynamic page-links generating
//how to access assets directory (images, font-awesome)
//how to register placeholder for failed GETS

$(document).ready(
  function() {
    window.pageNum = 1;
    requestData(window.pageNum);
    window.mostlocations={};
    window.mostrts=[];
    window.mostfollows=[];
  }
);

$(window).scroll(function() {
  //debugger
  if (!$('body').hasClass('processing')) {
    if($(window).scrollTop() + $(window).height() >= .9*$(document).height()) {
      $('body').addClass('processing');
      requestData(1);
      $('.rtlist').html('');
      $('.followlist').html('');
      $('.locationlist').html('');
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
function displayMostRT(statuses) {
    var newlist = window.mostrts.concat(statuses).sort(function (a, b) {
        if (a.retweet_count > b.retweet_count)
          return -1;
        if (a.retweet_count < b.retweet_count)
          return 1;
        // a must be equal to b
        return 0;
    });
    window.mostrts = newlist;

    for(var i = 0; i< 4; i++) {
        $('.rtlist').append(JST.toplistitem({tweet:window.mostrts[i]}));
    }
    
}
function displayMostLocations(statuses) {

  for(var i = 0; i < statuses.length; i++) {
        
        var locale = statuses[i].user.location;
        
        if (locale != "") {
            if (Object.keys(window.mostlocations).indexOf(locale) != -1) {
                window.mostlocations[locale]++;
            } else {
                window.mostlocations[locale] = 1;
            }
        }
    }
    
    console.log(window.mostlocations);
    var newlist = Object.keys(window.mostlocations).sort(function (a,b) {
        if(window.mostlocations[a] > window.mostlocations[b])
            return -1;
        if (window.mostlocations[a] < window.mostlocations[b])
            return 1;
        return 0;
    });
    console.log(newlist);
    for(var i = 0; i< 4; i++) {
        $('.locationlist').append(JST.toplistloc({location:newlist[i]}));
    }    
    
}
function displayMostFollowers(statuses) {
    
    var newlist = window.mostfollows.concat(statuses).sort(function (a, b) {
        if (a.user.followers_count > b.user.followers_count)
          return -1;
        if (a.user.followers_count < b.user.followers_count)
          return 1;
        // a must be equal to b
        return 0;
    })
    window.mostfollows = newlist;

    for(var i = 0; i< 4; i++) {
        $('.followlist').append(JST.toplistitem({tweet:window.mostfollows[i]}));
    }

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

    for(var i = 0; i< statuses.length; i++) {
        displayTweet(statuses[i]);  
    }
    window.twList = new List('tweets', options);
    displayMostRT(statuses);
    displayMostFollowers(statuses);
    displayMostLocations(statuses);

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