var ImageCircuitBreaker = require('circuit-breaker-js');
var httpreq = require('request');

function Image() {

}

var imageUrl = 'http://localhost:4568/listing/images?productId=';

var imageCircuitConfig = {
	windowDuration : 10000,
	numBuckets : 10,
	timeoutDuration : 1000,
	volumeThreshold : 1,
	errorThreshold : 50
};

var imageFallback = function(callback) {
	console.log('Image service is down : returning static image');
	var imgData = {
		"images" : "images not available at the moment"
	};
	callback(null, imgData);
};

var imageServiceBreaker = new ImageCircuitBreaker(imageCircuitConfig);

Image.prototype.getProductImages = function(productId, callback) {
	var imageCommand = function(success, failure) {
		httpreq({
			url : imageUrl + productId,
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
				var imgData = {
					"images" : body
				};
				success();
				callback(null, imgData);
			}
		});
	};
	imageServiceBreaker.run(imageCommand, imageFallback.bind(this, callback));
};

imageServiceBreaker.onCircuitOpen = function(metrics) {
	console.warn('Image Service Circuit open', metrics);
};

imageServiceBreaker.onCircuitClose = function(metrics) {
	console.warn('Image Service Circuit close', metrics);
};

module.exports = new Image();
