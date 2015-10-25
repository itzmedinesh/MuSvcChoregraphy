var ReviewCircuitBreaker = require('circuit-breaker-js');
var httpreq = require('request');

function Review() {
}

var reviewUrl = 'http://localhost:4568/listing/reviews/seller?sellerid=';

var reviewCircuitConfig = {
	windowDuration : 10000,
	numBuckets : 10,
	timeoutDuration : 1000,
	volumeThreshold : 1,
	errorThreshold : 50
};

var reviewFallback = function(callback) {
	console.log('Review service is down : Returning static review message.');
	var revData = {
		"reviews" : "reviews not available at the moment"
	};
	callback(null, revData);
};

var reviewServiceBreaker = new ReviewCircuitBreaker(reviewCircuitConfig);

Review.prototype.getProductReviews = function(sellerId, callback) {

	var reviewCommand = function(success, failure) {
		httpreq({
			url : reviewUrl + sellerId,
			proxy : "http://127.0.0.1:8888",
			method : 'GET',
			headers : {
				'Content-Type' : 'application/json'
			}
		}, function(error, resp, body) {
			if (error) {
				failure();
				callback(error, null);
			} else {
				var revData = {
					"reviews" : body
				};
				success();
				callback(null, revData);
			}
		});
	};
	reviewServiceBreaker.run(reviewCommand, reviewFallback.bind(this,callback));
};

reviewServiceBreaker.onCircuitOpen = function(metrics) {
	console.warn('Review Service Circuit open', metrics);
};

reviewServiceBreaker.onCircuitClose = function(metrics) {
	console.warn('Review Service Circuit close', metrics);
};

module.exports = new Review();
