var SearchCircuitBreaker = require('circuit-breaker-js');
var httpreq = require('request');

function Search() {
}

var searchUrl = 'http://localhost:4567/search/bykeyword?searchTerm=random&as=json';

var searchCircuitConfig = {
	windowDuration : 10000,
	numBuckets : 10,
	timeoutDuration : 300,
	volumeThreshold : 1,
	errorThreshold : 50
};

var searchFallback = function(callback) {
	console.log('Search service is down : returning static product list');

	var statprods = {
		count : 5,
		item : [ {
			id : 'Static Prod 1',
			state : 'Static State 1',
			user_id : '3l5nNr1Uwq',
			description : 'iyuS4Jb6_J',
			url : 'http://abc.org/'
		}, {
			id : 'Static Prod 2',
			state : 'Static State 2',
			user_id : 'ZNb0UKHuQK',
			description : 'eDPPKSV0c4',
			url : 'http://abc.org/'
		}, {
			id : 'Static Prod 3',
			state : 'Static State 3',
			user_id : 'zO2Ge2yGt1',
			description : '08_756KMLU',
			url : 'http://abc.org/'
		}, {
			id : 'Static Prod 4',
			state : 'Static State 4',
			user_id : 'tK4H9HQiCH',
			description : 'uwszQM_mpB',
			url : 'http://abc.org/'
		}, {
			id : 'Static Prod 5',
			state : 'Static State 5',
			user_id : 'kCWniiCW5H',
			description : 'iB_oCgMCOR',
			url : 'http://abc.org/'
		} ]
	};

	callback(null, statprods);

};

var searchServiceBreaker = new SearchCircuitBreaker(searchCircuitConfig);

Search.prototype.getProductList = function(maxSize, callback) {
	var searchCommand = function(success, failure) {
		httpreq(
				{
					url : searchUrl,
					proxy : "http://127.0.0.1:8888",
					method : 'GET',
					headers : {
						'Content-Type' : 'application/json'
					}
				},
				function(error, resp, body) {
					if (error) {
						failure();
						callback(error, null);
					} else {
						var products = JSON.parse(body);
						maxSize = (maxSize === -1 || maxSize > products.item.length) ? products.item.length
								: maxSize;
						var prods = products.item;
						prods = prods.slice(0, maxSize);
						products.item = prods;
						success();
						callback(null, products);
					}
				});
	};
	searchServiceBreaker
			.run(searchCommand, searchFallback.bind(this, callback));
};

searchServiceBreaker.onCircuitOpen = function(metrics) {
	console.warn('Search Service Circuit open', metrics);
};

searchServiceBreaker.onCircuitClose = function(metrics) {
	console.warn('Search Service Circuit close', metrics);
};

module.exports = new Search();
