//dynamic page-links generating
//how to access assets directory (images, font-awesome)
//how to register placeholder for failed GETS

$(document).ready(
  function() {    
    var tweet = new Tweet();
    var collection = new tweetCollection();
    collection.comparator = 'created_at';
    collection.fetch({data: {page:1},
                      remove: false,
                      error: function(model, xhr, options) {
                              console.log("something went wrong!");
                      }});
    
   
    new testview({'model':tweet, 'collection':collection});

  }
);

var Tweet = Backbone.Model.extend({
    defaults: {
        "handle": "person",
        "created_at": "now",
        "location": "here",
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
    sort_order: 'DESC',
    multiplier: 1,
    //comparator: 'created_at',
    initialize: function() {
        
        this.comparator = 'created_at';
        this.sort_order = 'ASC';
    },
    parse: function(data){
        
        for (var t = 0; t < data['statuses'].length;t++) {
            console.log(t);
            data['statuses'][t]['text'] = this.transformText(data['statuses'][t]['text']);
        }
        //debugger
        
        return data['statuses'];
    },
    transformText: function(statusText) {
      
      var twre = /\@([a-z]+)/ig;
      var twhash = /\#([a-z]+)/ig;
      var twurl = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
      //console.log(statusText);
      var newTxt = statusText.replace(twurl, '<a href="$1">$1</a>')
                           .replace(twre, '<a href="http://twitter.com/@$1">@$1</a>')
                           .replace(twhash, '<a href="http://search.twitter.com/search?q=$1">#$1</a>');
      return newTxt;
    },
    setMultiplier: function() {
      if (this.sort_order == 'ASC') {
          this.multiplier = -1;
      }
    },
    sortByRetweeted: function () {
      //this.setMultiplier();
      console.log('sorting now....multiplier '+this.multiplier)
      
      //this.comparator = 'retweet_count';
      this.sort(function (a, b) {
          if (a.attributes.retweet_count > b.attributes.retweet_count) {
              console.log(a+' '+b);
              return this.multiplier*1;
          }
          if (a.attributes.retweet_count < b.attributes.retweet_count)
          {
              debugger
              console.log(a+' '+b);
              return this.multiplier*-1;
          }
          return 0;
      }); 
    },
    sortByLocations: function () {

      this.sort(function (a, b) {
          if (a.attributes.user.followers_count < b.attributes.user.followers_count)
              return -1;
          if (a.attributes.user.followers_count > b.attributes.user.followers_count)
              return 1;
          return 0;
      });
    },
    sortByFollowers: function () {
      //this.setMultiplier();
      //debugger
      this.sort(function (a, b) {
          if (a.attributes.user.followers_count > b.attributes.user.followers_count)
              return this.multiplier*-1;
          if (a.attributes.user.followers_count < b.attributes.user.followers_count)
              return this.multiplier*1;
          return 0;
      });
    },



});
var sortview = Backbone.View.extend({
  el: '#backbone-sort-view',
  locations: "tweet-loc",
  retweet: "retweet_count",
  followers: "followers_count",
  initialize: function() {
      this.multiplier = 'ASC';

  },
  events: {
      'click .loc-button': 'sortByLocations',
      'click .retweet-button': 'sortByRetweeted',
      'click .followers-button': 'sortByFollowers'
  },
  sortByRetweeted: function() {
      this.collection.multiplier = -1*this.collection.multiplier;
      this.collection.sortByRetweeted();
  },
  sortByFollowers: function() {
      this.collection.multiplier = -1*this.collection.multiplier;
      this.collection.sortByFollowers();
  }

});
var testview = Backbone.View.extend({ 
  el: '#backbonetest',
  lastRendered: 0,
  lastComparator: 'created_at',

  initialize: function() {
      new sortview({'collection':this.collection} );  
      this.collection.on('sync sort', this.render, this);

      //abstract events, server-related, sorted
      _.bindAll(this, 'checkScroll');
      $(window).scroll(this.checkScroll);
  },
  events: {
  },

  render: function() {
      
      this.resetView();
      $('body').removeClass('processing');
      this.buildList();
      console.log('removing processing tag')
      

  },
  resetView: function() {
      $('.list').html('');
      this.lastRendered = 0;
  },
  errorMsg: function() {
      console.log("could not find");
  },
  buildList: function() {
      //debugger

      console.log('building list '+this.lastRendered + ' ' + this.collection.models.length);

      if (this.lastRendered <= this.collection.models.length) {
        
        var start = this.lastRendered;
        //console.log("LAST TWEET RENDERED: ", start);
        
        for(var i = start; i< this.collection.models.length; i++) {
            $('.list').append(JST.tweet({tweet:this.collection.models[i].attributes}));
            
            console.log('XXXXX adding index: '+i+' view')
            this.lastRendered += 1;
        }
        //debugger
        /*
        for(var i = 0; i< this.collection.models.length; i++) {
            $('.list').append(JST.tweet({tweet:this.collection.models[i].attributes}));
        }*/
      }      
  },
  checkScroll: function () {
      var triggerPoint = 100; // 100px from the bottom
      if( !$('body').hasClass('processing')) {
          //console.log('dont see any process');
          if($(window).scrollTop() + $(window).height() >= .9*$(document).height()) {
              $('body').addClass('processing');
              console.log('adding processing tag');
              this.collection.fetch( {
                  data: { page : this.collection.pageNum },
                  remove: false,
              });
            

              $('.rtlist').html('');
              $('.followlist').html('');
              $('.locationlist').html('');
              //not working, help.
              $("img").on('error', function() {
                $(this).attr('src', 'http://placekitten.com/52/52');
              });
              this.collection.pageNum += 1;
          }
          console.log('PAGE: ', this.collection.pageNum);
          
          
      }
    }
});


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