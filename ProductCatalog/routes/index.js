var async = require('async');
var url = require('url');
var searchSvc = require('./search.js');
var prodChoreography = require('./choreograph.js');

function validateListSize(request) {
	var listSize = -1;

	var queryObject = url.parse(request.url, true).query;

	if (queryObject && typeof queryObject !== 'undefined') {
		if (queryObject.listSize && typeof queryObject.listSize !== 'undefined') {
			listSize = queryObject.listSize;
		}
	}
	return listSize;
}

exports.productSvcsChoreographerParallel = function(request, response) {

	var listSize = validateListSize(request);

	var execTasks = [];
	execTasks.push(searchSvc.getProductList.bind(searchSvc, listSize));
	execTasks.push(prodChoreography.getProductDetailsParallel);

	async.waterfall(execTasks, function(err, prodResults) {
		if (err) {
			response.status = 500;
			response.send("{\"message\":\"Unable to process your request\"}");
		} else {
			response.status = 200;
			response.send(prodResults);
		}
	});

};

exports.productSvcsChoreographerSeries = function(request, response) {

	var listSize = validateListSize(request);

	var execTasks = [];
	execTasks.push(searchSvc.getProductList.bind(searchSvc, listSize));
	execTasks.push(prodChoreography.getProductDetailsSeries);

	async.waterfall(execTasks, function(err, prodResults) {
		if (err) {
			response.status = 500;
			response.send("{\"message\":\"Unable to process your request\"}");
		} else {
			response.status = 200;
			response.send(prodResults);
		}
	});

};