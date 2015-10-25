var async = require('async');
var reviewSvc = require('./review.js');
var imageSvc = require('./image.js');

function Choreography() {

}

Choreography.prototype.getProductDetailsParallel = function(listresults,
		callback) {

	var products = listresults;

	this.getImagesAndReviews = function(prodItem, callback) {

		var asyncProdTasks = [];

		asyncProdTasks.push(imageSvc.getProductImages.bind(imageSvc,
				prodItem.id));

		asyncProdTasks.push(reviewSvc.getProductReviews.bind(reviewSvc,
				prodItem.user_id));

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

	var asyncTasks = [];

	for (var prodindx = 0; prodindx < products.item.length; prodindx++) {
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

Choreography.prototype.getProductDetailsSeries = function(listresults, callback) {

	var products = listresults;

	this.getImagesAndReviews = function(prodItem, callback) {

		var asyncProdTasks = [];

		asyncProdTasks.push(imageSvc.getProductImages.bind(imageSvc,
				prodItem.id));

		asyncProdTasks.push(reviewSvc.getProductReviews.bind(reviewSvc,
				prodItem.user_id));

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

	var asyncTasks = [];

	for (var prodindx = 0; prodindx < products.item.length; prodindx++) {
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

module.exports = new Choreography();