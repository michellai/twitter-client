//dynamic page-links generating
//how to access assets directory (images, font-awesome)
//how to register placeholder for failed GETS

$(document).ready(
  function() {    
    var tweet = new Tweet();
    var collection = new tweetCollection();
    //collection.comparator = 'created_at';
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
    mostlocations: {},
    initialize: function() {

    },
    parse: function(data){
        for (var t = 0; t < data['statuses'].length;t++) {
            //console.log(t);
            data['statuses'][t]['text'] = this.transformText(data['statuses'][t]['text']);
        }
        return data['statuses'];
    },
    transformText: function(statusText) {
      var twre = /\@([a-z]+)/ig;
      var twhash = /\#([a-z]+)/ig;
      var twurl = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
      var newTxt = statusText.replace(twurl, '<a href="$1">$1</a>')
                           .replace(twre, '<a href="http://twitter.com/@$1">@$1</a>')
                           .replace(twhash, '<a href="http://search.twitter.com/search?q=$1">#$1</a>');
      return newTxt;
    },
    reverse: function() {
      this.multiplier *= -1;
    },
    storeLocations: function() {
      for(var i = 0; i < this.length; i++) {
        var locale = this.models[i].attributes.user.location;
        
        if (locale != "") {
            if (Object.keys(this.mostlocations).indexOf(locale) != -1) {
                this.mostlocations[locale]++;
            } else {
                this.mostlocations[locale] = 1;
            }
        } 
      }
      for(var i = 0; i < this.length; i++) {
          var locale = this.models[i].attributes.user.location;
          
          if (locale != "") {
              console.log('setting locale: '+locale+'  '+this.mostlocations[locale])
              this.models[i].attributes.user.location.frequency = this.mostlocations[locale];
          } else {
            this.models[i].attributes.user.location.frequency = new Number()
          }
      }
      
    },
    sortByLocations: function() {

      this.storeLocations();
      

      this.sortByKey('user.location.frequency');
      

    },
    sortByKey: function(key) {
      this.comparator = function (a, b) {
        if (eval('a.attributes.'+key) > eval('b.attributes.'+key))
            return this.multiplier;
        if (eval('a.attributes.'+key) < eval('b.attributes.'+key))
            return -this.multiplier;
        return 0;
      }
      this.sort();

    },

});
var sortview = Backbone.View.extend({
  el: '#backbone-sort-view',
  locations: "user.location",
  retweet: "retweet_count",
  created: "created_at",
  followers: "user.followers_count",
  numTweets: "user.statuses_count",
  
  initialize: function() {
      lastSort: "created_at";
  },
  events: {
      'click .loc-button': 'sortByLocations',
      'click .retweet-button': 'sortByRetweeted',
      'click .followers-button': 'sortByFollowers',
      'click .created-button': 'sortByCreated',
      'click .num-tweet-button': 'sortByNumTweets'
  },
  resetMultiplier: function(thisSort) {
    console.log("Last Sort: "+this.lastSort)
    if (this.lastSort == thisSort) {
        console.log("same sort, flipping");
        this.collection.multiplier *= -1;
      } else {
        this.collection.multiplier = 1;
      }
  },
  sortByLocations: function() {
      this.resetMultiplier(this.locations);
      this.collection.sortByLocations();
      this.lastSort = this.locations;      
  },
  sortByRetweeted: function() {
      this.resetMultiplier(this.retweet);
      this.collection.sortByKey(this.retweet);
      this.lastSort = this.retweet;      
  },
  sortByFollowers: function() {
      this.resetMultiplier(this.followers);
      this.collection.sortByKey(this.followers);
      this.lastSort = this.followers
  },
  sortByCreated: function() {
      this.resetMultiplier(this.created);
      this.collection.sortByKey(this.created);
      this.lastSort = this.created;
  },
  sortByNumTweets: function() {
      this.resetMultiplier(this.numTweets);
      this.collection.sortByKey(this.numTweets);
      this.lastSort = this.numTweets;
  }

});
var testview = Backbone.View.extend({ 
  el: '#backbonetest',
  lastRendered: 0,
  //lastComparator: 'created_at',

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
      //console.log('removing processing tag')
      

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

      //console.log('building list '+this.lastRendered + ' ' + this.collection.models.length);

      if (this.lastRendered <= this.collection.models.length) {
        
        var start = this.lastRendered;
        //console.log("LAST TWEET RENDERED: ", start);
        
        for(var i = start; i< this.collection.models.length; i++) {
            $('.list').append(JST.tweet({tweet:this.collection.models[i].attributes}));
            
            //console.log('XXXXX adding index: '+i+' view')
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
          //console.log('PAGE: ', this.collection.pageNum);
          
          
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