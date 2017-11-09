import { Meteor } from 'meteor/meteor';
let assert = require('assert');
let uuid = require("uuid");
var Twit = require('twit')

Meteor.startup(() => {
  var Future = Npm.require('fibers/future');
  var getResult = (result) => {
    return result;
  };
  Meteor.methods({

    googleSentiments: (tweet) => {
        const NLP = require('google-nlp')
        const API_KEY = 'AIzaSyDmr-bkvwLbEZG47wPb1bofNhUDLMh-5kE';
        let nlp = new NLP(key=API_KEY)
        console.log('here tweet is')
        console.log(tweet)
        return nlp.analyzeSentiment(tweet).then(function(sentiment) {
          return(sentiment);
        }).catch(function(error) {
           console.log('Error:', JSON.stringify(error.message));
        });
    },

    getTweets: (query) => {
      check(query, String)
      var future = new Future();
      // https://github.com/ttezel/twit
      var Twitter = new Twit({
        consumer_key: "SEXku2x29ZXfBZwGK48DMozqo",
        consumer_secret: "hsI62Smn58PktOzpvdkBZPVJM9qcRH18ntonVuxZnIQdtLx5zu",
        access_token: "479739181-v277UfVDY3qohLpM2tXE2PyQPKqcK4F5s14CEMi3",
        access_token_secret: "Qx6TDuEaCvoFgGkrn5cvad1sFNtSOS1G6cUp3ZP7vJcYU"
      });
      // get tweets
      Twitter.get('statuses/user_timeline',
      // params for twitter api call
      {screen_name: query, count: 20 },
      // callback
      (error,data,response) => {
        if (error) {
          // || data.errors
          future.return(error);
        }

        let tweetVals = [];
        returnSentiments(data,tweetVals);
        function returnSentiments (data,tweetVals) {
          // format tweet text
          if (data)
          data.forEach((dat) => {
            if(!dat.text) {
              console.log('no text')
              return;
            }
            console.log('return sentiments')
            console.log(data, tweetVals)
            let tweetObj = {};
            let text = dat.text;
            var removemarkdown = require('remove-markdown');
            tweetObj.text = removemarkdown(text);
            if (dat.entities) {
              tweetObj.entities = dat.entities;
            };
            // remove links
            var cleanThisTweet = require('clean-this-tweet-up');
            tweetObj = cleanThisTweet(tweetObj);
            if (tweetObj.entities) {
              delete tweetObj.entities;
            }
            // filter out unreadable words for sentiment analysis
            // remove special characters & remove entirely any words that have 'htt' in them (links)
            tweetObj = tweetObj
              .replace(/[^a-zA-Z' ]/g, " ")
              .replace(/ *\b\S*?htt\S*\b/g, " ");
            // remove entities after using them in cleanThisTweet https://github.com/coleww/clean-this-tweet-up/blob/master/test.js#L7-L16
            // format the sentiment api call text used later in getSentiments
            let apiBaseUrl = 'http://api.datumbox.com/1.0/TwitterSentimentAnalysis.json?api_key=';
            let datumBoxapiKey = Meteor.settings.private.sentiment.apiKey;
            let sentimentUrl = apiBaseUrl+datumBoxapiKey+tweetObj;
            let profImage = dat.user.profile_image_url;
            // create object for rendering results while we call the sentiment api
            let tweetVal = {
              'text':tweetObj,
              'datumboxSentiment': '',
              'googleSentiment': '',
              'id_str': dat.id_str,
              'profImage': profImage,
              'sentimentUrl':sentimentUrl
            }
            tweetVals.push(tweetVal);
          });
        }
        // create tweet obj with formatted text
        let tweetObj = {
          id: uuid(),
          username: query,
          tweets: tweetVals
          //googleSentiments:
        };
        future.return(tweetObj);
      })
      // end of get tweets callback, wait until all tweets are formatted
      return future.wait();
    },

    getSentiments: (tweets) => {
      var urls = [];
      tweets.tweets.forEach((tweet) => {
        // datumbox urls
        urls.push(tweet.sentimentUrl);
      })
      var futures = _.map(urls, (url) => {
        // Set up a future for the current job
        var future = new Future();
        // A callback so the job can signal completion
        var onComplete = future.resolver();
        // async http call
        setTimeout(delay, 300);
        function delay () {console.log('delay call to sent api');}
        HTTP.call("POST",url, (error, result) => {
          if (error) {
            console.log('Error posting to api')
            console.log(error)
            return(error);
          }
          // Get the result if there was no error
          var title = (!error) && getResult(result);
          // Inform the future that we're done with it
          onComplete(error, title);
        });
        // Return the future
        return future;
      });
      // wait for all futures to finish
      Future.wait(futures);
      // and grab the results out.
      return _.invoke(futures, 'get');
      done();
    }
  })
});
