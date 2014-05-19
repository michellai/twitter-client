//dynamic page-links generating
//how to access assets directory (images, font-awesome)
//how to register placeholder for failed GETS

$(document).ready(
  function() {    
    var tweet = new Tweet();
    var collection = new tweetCollection();
    collection.fetch({data: {page:1},
                      remove: false,
                      error: function(model, xhr, options) {
                              console.log("something went wrong!");
                      }});
    
   
    new testview({'model':tweet, 'collection':collection});
    new rtview({'model':tweet, 'collection':collection});
    //new locview({'model':tweet, 'collection':collection});
    new followersview({'model':tweet, 'collection':collection});
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
    mostlocations: [],
    mostrts: [],
    mostfollows: [],
    initialize: function() {

    },
    parse: function(data){
        for (var t = 0; t < data['statuses'].length;t++) {
            //console.log(t);
            data['statuses'][t]['text'] = this.transformText(data['statuses'][t]['text']);
        }
        //data['statuses'][t]['user']['location']['']
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
      /* First, Go through list and store dictionary of occurences per locale */
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
      /* Then, Go through list and set loc_frequency attribute for each tweet */
      for(var i = 0; i < this.length; i++) {
          var locale = this.models[i].attributes.user.location;
          
          if (locale != "") {
              console.log('setting locale: '+locale+'  '+this.mostlocations[locale])
              this.models[i].attributes.user.loc_frequency = this.mostlocations[locale];
          } else {
            this.models[i].attributes.user.loc_frequency = new Number()
          }
      }      
    },
    sortByKey: function(key) {
      if (key == "user.loc_frequency") {
          this.mostlocations = {};
          this.storeLocations();
      }
      this.comparator = function (a, b) {
        if (eval('a.attributes.'+key) > eval('b.attributes.'+key))
            return -this.multiplier;
        if (eval('a.attributes.'+key) < eval('b.attributes.'+key))
            return this.multiplier;
        return 0;
      }
      this.sort();

    },
    
    onlyUnique: function(value, index, self) { 
        return self.indexOf(value) === index;
    },

    getUniqueNames: function(key) {
        var sortedVals = [];
        
        for (var i = 0; i < this.length; i++) {
          
          sortedVals.push(eval('this.models[i].attributes.user'));
        }
        //debugger
        sortedVals.filter( this.onlyUnique );
        return sortedVals;
        
    }

});

var sortview = Backbone.View.extend({
  el: '#backbone-sort-view',
  
  initialize: function() {
      lastSort: "created_at";
  },
  events: {
      'click .loc-button': 'sortByKey',
      'click .retweet-button': 'sortByKey',
      'click .followers-button': 'sortByKey',
      'click .created-button': 'sortByKey',
      'click .num-tweet-button': 'sortByKey'
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
  sortByKey: function(e) {
      this.resetMultiplier($(e.target).data('sortkey'));
      this.collection.sortByKey($(e.target).data('sortkey'));
      this.lastSort = $(e.target).data('sortkey');
  },

});

var locview = Backbone.View.extend({
  el: '#backbone-most-locations',
  
  initialize: function() {
      this.collection.on('sync', this.render, this);
  },
  resetView: function() {
      $('.locationlist').html('');
  },
  buildList: function() {
      for(var i = 0; i< 5; i++)
          $('.locationlist').append(JST.toplistloc({tweet:this.collection.models[i].attributes}));      
  },
  render: function() {
      this.collection.sortByKey(this.$el.data('sortkey')); 
      this.resetView();
      this.buildList();
  },

});

var rtview = Backbone.View.extend({
  el: '#backbone-most-rt',
  
  initialize: function() {
      this.collection.on('sync', this.render, this);
  },

  resetView: function() {
      $('.rtlist').html('');
  },
  buildList: function() {
      var unique = this.collection.getUniqueNames();
      //debugger
      for(var i = 0; i< 5; i++)
          $('.rtlist').append(JST.toplistitem({tweet:unique[i]}));
  },
  render: function() {
      this.collection.sortByKey(this.$el.data('sortkey')); 
      this.resetView();
      this.buildList();
  },

});

var followersview = Backbone.View.extend({
  el: '#backbone-most-follow',
  
  initialize: function() {
      this.collection.on('sync', this.render, this);
  },
  resetView: function() {
      $('.followlist').html('');
  },
  buildList: function() {
      var unique = this.collection.getUniqueNames();
      //debugger
      for(var i = 0; i< 5; i++)
          $('.followlist').append(JST.toplistitem({tweet:unique[i]}));
  },
  render: function() {
      this.collection.sortByKey(this.$el.data('sortkey')); 
      this.resetView();
      this.buildList();
  },

});

var testview = Backbone.View.extend({ 
  el: '#backbonetest',
  lastRendered: 0,

  initialize: function() {
      new sortview({'collection':this.collection} );  
      this.collection.on('sync sort', this.render, this);
      _.bindAll(this, 'checkScroll');
      $(window).scroll(this.checkScroll);
  },
  events: {
  },
  render: function() {    
      this.resetView();
      $('body').removeClass('processing');
      this.buildList();
  },
  resetView: function() {
      $('.list').html('');
      this.lastRendered = 0;
  },
  errorMsg: function() {
      console.log("could not find");
  },
  buildList: function() {
      if (this.lastRendered <= this.collection.models.length) {        
        var start = this.lastRendered;
        
        for(var i = start; i< this.collection.models.length; i++) {
            //debugger
            $('.list').append(JST.tweet({tweet:this.collection.models[i].attributes}));
            this.lastRendered += 1;
        }
      }      
  },
  checkScroll: function () {
      var triggerPoint = 100; // 100px from the bottom
      if( !$('body').hasClass('processing')) {
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