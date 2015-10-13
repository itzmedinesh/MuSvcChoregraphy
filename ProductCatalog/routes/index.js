var async = require('async');
var httpreq = require('request');
var url = require('url');

function Product() {
}

function ProductDetails() {
}

exports.productSvcsChoreographerParallel = function(request, response) {

	var listSize = -1;

	var queryObject = url.parse(request.url, true).query;

	if (queryObject && typeof queryObject !== 'undefined') {
		if (queryObject.listSize && typeof queryObject.listSize !== 'undefined') {
			listSize = queryObject.listSize;
		}
	}

	var prodInfo = new Product();

	var serialExecTasks = [];
	serialExecTasks.push(prodInfo.getProductList.bind(prodInfo, listSize));
	serialExecTasks.push(prodInfo.getProductDetails);

	async.waterfall(serialExecTasks, function(err, prodResults) {
		if (err) {
			response.status = 500;
			response.send("{\"message\":\"Unable to process your request\"}");
		} else {
			response.status = 200;
			response.send(prodResults);
		}
	});

};

exports.productSvcsChoreographerSerial = function(request, response) {

	var listSize = -1;

	var queryObject = url.parse(request.url, true).query;

	if (queryObject && typeof queryObject !== 'undefined') {
		if (queryObject.listSize && typeof queryObject.listSize !== 'undefined') {
			listSize = queryObject.listSize;
		}
	}

	var prodInfo = new Product();

	var serialExecTasks = [];
	serialExecTasks.push(prodInfo.getProductList.bind(prodInfo, listSize));
	serialExecTasks.push(prodInfo.getProductDetailsSerialExec);

	async.waterfall(serialExecTasks, function(err, prodResults) {
		if (err) {
			response.status = 500;
			response.send("{\"message\":\"Unable to process your request\"}");
		} else {
			response.status = 200;
			response.send(prodResults);
		}
	});

};

Product.prototype.getProductList = function(maxSize, callback) {
	httpreq(
			{
				url : 'http://localhost:4567/search/bykeyword?searchTerm=random&as=json',
				proxy : "http://127.0.0.1:8888",
				method : 'GET',
				headers : {
					'Content-Type' : 'application/json'
				}
			}, function(error, resp, body) {
				if (error) {
					callback(error, null, null);
				} else {
					callback(null, body, maxSize);
				}
			});
};

Product.prototype.getProductDetails = function(listresults, maxSize, callback) {

	var products = JSON.parse(listresults);

	var productDetails = new ProductDetails();

	this.getImagesAndReviews = function(prodItem, callback) {

		var asyncProdTasks = [];

		asyncProdTasks.push(productDetails.getProductImages.bind(
				productDetails, prodItem.id));

		asyncProdTasks.push(productDetails.getProductReviews.bind(
				productDetails, prodItem.user_id));

		var prodData = {
			"productId" : prodItem.id,
			"productDesc" : prodItem.description,
			"sellerId" : prodItem.user_id
		};

		async
				.parallel(
						asyncProdTasks,
						function(err, results) {
							if (err) {
								prodData.error = "{\"message\":\"could not retrieve product details\"}";
								callback(prodData, null);
							} else {
								prodData.images = results[0].images;
								prodData.reviews = results[1].reviews;
								callback(null, prodData);
							}
						});
	};

	maxSize = (maxSize === -1 || maxSize > products.item.length) ? products.item.length
			: maxSize;

	var asyncTasks = [];

	for (var prodindx = 0; prodindx < maxSize; prodindx++) {
		var asyncTask = this.getImagesAndReviews.bind(this,
				products.item[prodindx]);
		asyncTasks.push(asyncTask);
	}

	async.parallel(asyncTasks, function(err, results) {
		if (err) {
			callback(err, null);
		} else {
			callback(null, results);
		}
	});

};

Product.prototype.getProductDetailsSerialExec = function(listresults, maxSize,
		callback) {

	var products = JSON.parse(listresults);

	var productDetails = new ProductDetails();

	this.getImagesAndReviews = function(prodItem, callback) {

		var asyncProdTasks = [];

		asyncProdTasks.push(productDetails.getProductImages.bind(
				productDetails, prodItem.id));

		asyncProdTasks.push(productDetails.getProductReviews.bind(
				productDetails, prodItem.user_id));

		var prodData = {
			"productId" : prodItem.id,
			"productDesc" : prodItem.description,
			"sellerId" : prodItem.user_id
		};

		async
				.series(
						asyncProdTasks,
						function(err, results) {
							if (err) {
								prodData.error = "{\"message\":\"could not retrieve product details\"}";
								callback(prodData, null);
							} else {
								prodData.images = results[0].images;
								prodData.reviews = results[1].reviews;
								callback(null, prodData);
							}
						});
	};

	maxSize = maxSize === -1 ? products.item.length : maxSize;

	var asyncTasks = [];

	for (var prodindx = 0; prodindx < maxSize; prodindx++) {
		var asyncTask = this.getImagesAndReviews.bind(this,
				products.item[prodindx]);
		asyncTasks.push(asyncTask);
	}

	async.series(asyncTasks, function(err, results) {
		if (err) {
			callback(err, null);
		} else {
			callback(null, results);
		}
	});

};

ProductDetails.prototype.getProductImages = function(productId, callback) {
	httpreq({
		url : 'http://localhost:4568/listing/images?productId=' + productId,
		proxy : "http://127.0.0.1:8888",
		method : 'GET',
		headers : {
			'Content-Type' : 'application/json'
		}
	}, function(error, resp, body) {
		if (error) {
			callback(error, null);
		} else {
			var imgData = {
				"images" : body
			};
			callback(null, imgData);
		}
	});
};

ProductDetails.prototype.getProductReviews = function(sellerId, callback) {
	httpreq({
		url : 'http://localhost:4568/listing/reviews/seller?sellerid='
				+ sellerId,
		proxy : "http://127.0.0.1:8888",
		method : 'GET',
		headers : {
			'Content-Type' : 'application/json'
		}
	}, function(error, resp, body) {
		if (error) {
			callback(error, null);
		} else {
			var revData = {
				"reviews" : body
			};
			callback(null, revData);
		}
	});
};
