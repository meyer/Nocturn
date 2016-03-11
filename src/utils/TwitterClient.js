import JsonLoader from './JsonLoader';
import Twitter    from 'twitter';
import fs         from 'fs';
import path       from 'path';
import { CREDENTIALS_JSON } from './Authentication';

export default class TwitterClient {
  constructor(accessToken) {
    var credentials = JsonLoader.read(CREDENTIALS_JSON);

    this.client = Twitter({
      consumer_key:        credentials['consumerKey'],
      consumer_secret:     credentials['consumerSecret'],
      access_token_key:    accessToken['accessToken'],
      access_token_secret: accessToken['accessTokenSecret'],
    });
  }

  homeTimeline(callback) {
    return this.client.get('statuses/home_timeline', {}, (error, tweets, response) => {
      if (error) {
        return console.log(JSON.stringify(error));
      }

      return callback(tweets);
    });
  }

  mentionsTimeline(callback) {
    return this.client.get('statuses/mentions_timeline', {}, (error, tweets, response) => {
      if (error) {
        return console.log(JSON.stringify(error));
      }

      return callback(tweets);
    });
  }

  userStream(callback) {
    this.client.stream('user', {}, (stream) => {
      stream.on('data', function(data) {
        if (data['friends']) {
          // noop
        } else if (data['event']) {
          // noop
        } else if (data['delete']) {
          // noop
        } else if (data['created_at']) {
          // This is a normal tweet
          return callback(data);
        }
      });

      stream.on('error', (error) => {
        // ignoring because of too many errors
        // return console.log(JSON.stringify(error));
      });
    });
  }

  updateStatus(tweet, inReplyTo, callback) {
    if (tweet === '') {
      return;
    }

    var params = { status: tweet };
    if (inReplyTo !== 0) {
      params['in_reply_to_status_id'] = inReplyTo;
    }
    this.client.post('statuses/update', params, (error, data, response) => {
      if (error) {
        console.log(JSON.stringify(error));
        return;
      }
      callback(data);
    });
  }

  favoriteStatus(tweetId, callback) {
    return this.client.post('favorites/create', { id: tweetId }, (error, data, response) => {
      if (error) {
        console.log(JSON.stringify(error));
        return;
      }

      return callback(data);
    });
  }

  retweetStatus(tweetId, callback) {
    return this.client.post(`statuses/retweet/${tweetId}`, {}, (error, data, response) => {
      if (error) {
        console.log(JSON.stringify(error));
        return;
      }
      callback(data);
    });
  }

  deleteStatus(tweetId, callback) {
    return this.client.post(`statuses/destroy/${tweetId}`, {}, (error, data, response) => {
      if (error) {
        return console.log(JSON.stringify(error));
      }

      return callback();
    });
  }

  verifyCredentials(callback) {
    return this.client.get('account/verify_credentials', {}, (error, data, response) => {
      if (error) {
        return console.log(JSON.stringify(error));
      }

      return callback(data);
    });
  }

  listsList(callback) {
    return this.client.get('lists/list', {}, (error, data, response) => {
      if (error) {
        return console.log(JSON.stringify(error));
      }

      return callback(data);
    });
  }

  listsStatuses(id, callback) {
    return this.client.get('lists/statuses', { list_id: id }, (error, tweets, response) => {
      if (error) {
        return console.log(JSON.stringify(error));
      }

      callback(tweets);
    });
  }

  searchTweets(query, callback) {
    return this.client.get('search/tweets', { q: query }, (error, data, response) => {
      if (error) {
        return console.log(JSON.stringify(error));
      }

      callback(data['statuses']);
    });
  }
}
