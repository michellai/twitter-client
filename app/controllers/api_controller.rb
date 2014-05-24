class ApiController < ApplicationController

require 'twitter'
  
  def retrieveTweets #called an action /function/method
    client = Twitter::REST::Client.new do |config|
      config.consumer_key        = "cCwDJAvqYc3D2HS3dY1bMpRw7"
      config.consumer_secret     = "ruIKWD52RodYXc5kYWQZbNWJJ0DA08gkvWzPkN1AtP333LPpf2"
      config.access_token        = "14299674-At4JJSGnnUNe1txGbNdtcFmLTCF9MkHXQW9N7TRgj" #oauth
      config.access_token_secret = "y3awxIBSfGY7jSbSKapO0GZ15ryd8RDlXPs7DNaRNIVVW" #oauth secret
    end
    """
    file = File.join(Rails.root, 'app', 'assets', 'javascripts', 'stanford1.json')
    if Integer(params[:page]) <= 6
      file = File.join(Rails.root, 'app', 'assets', 'javascripts', 'stanford' + params[:page] + '.json')
    end

    tweets = JSON.parse(File.read(file))
    render :json => tweets, :status => 200
    """
    #need to build in some concept of page number... max id? :max_id => 460143942852292610,  :count=> 4
    #binding.pry
    if params[:max_id].nil?
      results = client.search("stanford", :result_type => "recent").take(20)
    else
      #binding.pry
      results = client.search("stanford", :max_id => params[:max_id], :result_type => "recent").take(20)
    end  
    render :json => results, :status => 200
  end

  def postTweet
    if params.has_key?(:message) && params.has_key?(:username)
      message = { :message => "Your response has been successfully posted."}
      render :json => message
    else
      message = 'There was an error with your response.'
      render :json => {:error => message}.to_json, :status => 500
    end
  end

end
