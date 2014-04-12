//dynamic page-links generating
//how to access assets directory (images, font-awesome)
//how to register placeholder for failed GETS

$(document).ready(

  function() {
    
    //window.pageNum = 1;
    //requestData(window.pageNum);
    window.mostlocations={};
    window.mostrts=[];
    window.mostfollows=[];
    var tweet = new Tweet();
    var collection = new tweetCollection();
    collection.fetch({data: {page:1} });
    
    new testview({'model':tweet, 'collection':collection});
  }
);

var Tweet = Backbone.Model.extend({
  defaults: {
    "handle": "person",
    "created": "now",
    "tweet-loc": "here",
    "faves": "0",
    "retweets": "0",
    "followers": "0",
    "tweets": "0",
    "favorited": "",
    "retweeted": "",
    "tweet-text": ""
  }
});

var tweetCollection = Backbone.Collection.extend({
    url: "/api/retrieveTweets/abcd",
    pageNum: 1,
    model: Tweet, //type
    parse: function(data){
        
        return data['statuses'];
    }
});

var testview = Backbone.View.extend({ 
  el: '#backbonetest',
  initialize: function() {
    this.isLoading = false;
    this.collection.on('sync', this.render, this);
    //abstract events, server-related, sorted

  },
  events: {
    'click': 'clickedHere',
    'scroll': 'checkScroll'
    //user actions, click/hover, scroll, etc.
  },
  render: function() {
    
    //this.collection.models[0].attributes.appetizer
    //possibly: $('body').removeClass('processing');
    this.isLoading = false;
    this.loadResults();
    //this.$el.html(displayAll(this.collection()));
  },
  transformText: function(tweetTxt) {
    var twre = /\@([a-z]+)/ig;
    var twhash = /\#([a-z]+)/ig;
    var twurl = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    var newTxt = tweetTxt.replace(twurl, '<a href="$1">$1</a>')
                         .replace(twre, '<a href="http://twitter.com/@$1">@$1</a>')
                         .replace(twhash, '<a href="http://search.twitter.com/search?q=$1">#$1</a>');
    return newTxt;
  },
  loadResults: function() {
    var that = this;
    this.isLoading = true;
    debugger
    this.collection.fetch( {
      
      data: { page : this.collection.pageNum },
    });

    //this.collection.pageNum += 1;
    
    this.buildList();
    this.isLoading = false;
    
  },
  buildList: function() {
    var options = {
        valueNames: [ 'created', 'retweets', 'faves', 'followers', 'tweets' ]
    };

    for(var i = 0; i< this.collection.models.length; i++) {
        var tweetText = this.collection.models[i].attributes['text'];
        this.collection.models[i].attributes['text'] = this.transformText(tweetText);
        $('.list').append(JST.tweet({tweet:this.collection.models[i].attributes}));
    }
    window.twList = new List('tweets', options);
  },
  clickedHere: function() {
    //debugger
    this.$el.html('world');
  },
  checkScroll: function () {
      debugger
      var triggerPoint = 100; // 100px from the bottom
      if( !this.isLoading && this.el.scrollTop + this.el.clientHeight + triggerPoint > this.el.scrollHeight ) {
          this.collection.pageNum += 1; // Load next page
          this.loadResults();
      }
    }
});

/*
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
*/
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
    
    //console.log(window.mostlocations);
    var newlist = Object.keys(window.mostlocations).sort(function (a,b) {
        if(window.mostlocations[a] > window.mostlocations[b])
            return -1;
        if (window.mostlocations[a] < window.mostlocations[b])
            return 1;
        return 0;
    });
    //console.log(newlist);
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

function displayAll(statuses) {
    var options = {
        valueNames: [ 'created', 'retweets', 'faves', 'followers', 'tweets' ]
    };

    for(var i = 0; i< statuses.length; i++) {
        displayTweet(statuses.models[i]);  
    }
    window.twList = new List('tweets', options);
    /*displayMostRT(statuses);
    displayMostFollowers(statuses);
    displayMostLocations(statuses);*/

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