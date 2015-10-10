/**
 * Module dependencies.
 */

var express = require('express'), routes = require('./routes'), http = require('http'), path = require('path');

var dustjs = require('adaro');

var app = express();

// all environments
app.engine('dust', dustjs.dust({
	cache : true
}));
app.set('view engine', 'dust');
app.set('views', __dirname + '/views');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.set('port', process.env.PORT || 7000);

app.get('/api/product/catalog', routes.getProductDetails);

http.createServer(app).listen(
		app.get('port'),
		function() {
			console.log('Product catalog available on port '
					+ app.get('port'));
		});
