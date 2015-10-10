var async = require('async');
var httpreq = require('request');

exports.getProductDetails = function(request, response) {

	request.header("Access-Control-Allow-Origin", "*");
	request.header("Access-Control-Allow-Headers", "X-Requested-With");

	var finalres = {};

	async
			.series(
					[ function(callback) {
						httpreq(
								{
									url : 'http://localhost:4567/search/bykeyword?searchTerm=random&as=json',
									method : 'GET',
									headers : {
										'Content-Type' : 'application/json'
									}
								}, function(error, resp, body) {
									if (error) {
										callback(error, null);
									} else {
										callback(null, body);
									}
								});
					} ],
					function(err, searchresults) {
						if (err) {
							response.status = 500;
							response
									.send("{\"message\":\"Unable to process your request\"}");
						} else {
							finalres.products = searchresults;
							async
									.parallel(
											[
													function(callback) {
														httpreq(
																{
																	url : 'http://localhost:4568/listing/images?productId=12342',
																	method : 'GET',
																	headers : {
																		'Content-Type' : 'application/json'
																	}
																},
																function(error,
																		resp,
																		body) {
																	if (error) {
																		callback(
																				error,
																				null);
																	} else {
																		callback(
																				null,
																				body);
																	}
																});

													},
													function(callback) {
														httpreq(
																{
																	url : 'http://localhost:4568/listing/reviews/seller?sellerid=1234',
																	method : 'GET',
																	headers : {
																		'Content-Type' : 'application/json'
																	}
																},
																function(error,
																		resp,
																		body) {
																	if (error) {
																		callback(
																				error,
																				null);
																	} else {
																		callback(
																				null,
																				body);
																	}
																});
													} ],
											function(err, results) {
												if (err) {
													response.status = 500;
													response
															.send("{\"message\":\"Unable to process your request\"}");
												} else {
													finalres.product_details = results;
													response.status = 200;
													response.send(finalres);
												}

											});
						}
					});

};