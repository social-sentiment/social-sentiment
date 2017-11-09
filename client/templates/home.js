
Template.home.onCreated(() => {
  tweets = new ReactiveVar();
  import { Meteor } from 'meteor/meteor';
  import React from 'react';
  import { render } from 'react-dom';
})
Template.home.helpers({
  ready: () => {
    return true
  },
  tweets: () => {
    return tweets.get()
  }
});

Template.home.events({

  'submit form' : (e) => {
    e.preventDefault();
    let query = $('input#query').val();
    console.log(query);
    $('.status').text('Getting Tweets...');
    // call twitter api to get users tweets
    // returns obj res.tweets
    Meteor.call('getTweets', query, (err,res) => {
      //$('.status').text('Getting Tweets...');
      // render tweet results before getting the sentiments for each tweet
      console.log('res is ', res)
      console.log('err is', err)
      tweets.set(res.tweets);
      // call twitter sentiment api at http://api.datumbox.com/ with tweets
      if (err) {
        $('.status-update').text('error getting tweets');
        return;
      }
      let i = 0;
      $('.status').text('Getting tweet sentiments from Google');
      //$('.status-update').text('Getting sentiment analysis from Google');
      const tweetsArrayLength = res.tweets.length -1;
      let polarityPositives = 0;
      let polarityNegatives = 0;
      // unhide
      //$('.overall-avg').toggleClass('hidden');
      res.tweets.forEach(function(tweet, tweetsArrayLength) {
        let tweetText = tweet.text;
        let polarityArray = [];
        Meteor.call('googleSentiments', tweetText, i, tweetsArrayLength, (err, res) => {
          if (err) {
            console.log(err);
          } else {
            let polarity = res.documentSentiment.polarity;
            const magnitude = res.documentSentiment.magnitude;
            polarityArray.push(polarity);
            $('.google-sentiment-magnitude').eq(i).html(magnitude);
            // handle totals
            if (polarity == 1) {
              polarity = 'positive';
              polarityPositives++;
            } else {
              polarity = 'negative';
              polarityNegatives++;
            }
            $('.google-sentiment-polarity').eq(i).html(polarity);
            i++;
            $('.google-total-positives').text(polarityPositives)
            $('.google-total-negatives').text(polarityNegatives)
          }
        });
      })
      let DBpolarityPositives = 0;
      let DBpolarityNegatives = 0;
      let DBpolarityNeutrals = 0;
      $('.status').text('Getting tweet sentiments from Datumbox');
      Meteor.call('getSentiments', res, (err,res) => {
        if (err || res.response.statusCode=== 503) {
          $('.status').text(err.message + ' ' + err + ' ' + err.allErrors + ' ' + res);
          console.log('api err')
          console.log('datum err', err)
          console.log(res)
          return;
        } else {
          console.log('got one datum res');
	  console.log('datum res', res);
	}
       // $('.status-update').toggleClass('hidden');
        //$('.status-update').text('Getting sentiment analysis from Datumbox');

        let i = 0;         // using ()=>{} here loses context
        $('.sentiment').map(function() {
          let sentiment = res[i].data.output.result;
          console.log(sentiment)
          if (sentiment) {
            $(this).text(sentiment);
            // handle totals
            if (sentiment == 'positive') {
              DBpolarityPositives++;
            }
            if (sentiment == 'negative'){
              DBpolarityNegatives++;
            }
            if (sentiment == 'neutral') {
              DBpolarityNeutrals++;
            }
            $('.db-total-positives').text(DBpolarityPositives);
            $('.db-total-negatives').text(DBpolarityNegatives);
            $('.db-total-neutrals').text(DBpolarityNeutrals);
          } else {
            $('.status').text('');
            $(this).text('Error getting results');
            console.log(JSON.stringify(res))
          }
          i++;
         }).get();
      });
    })
  }
})
