var express = require('express');
var router = express.Router();

var Parse = require('parse').Parse;
Parse.initialize("FqNt8xkKnxeEdBqV5te9vJAOQQ7dRNsO69Bqno9y", "yrRCAxIDLnAxnKaBltA2YfznMnh6eEY2uuG0QCDl");

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Stockr' });
});

router.get('/quote', function(req, res){
	res.render('query');
})

router.post('/quote', function(req, res){
	var stockname = req.body.stockname;
	var json_obj = JSON.parse(Get(Url(stockname)));
	var stock = json_obj.query.results.quote;
	res.render('stock', {stock: stock});
})

router.get('/test', function(req, res) {
	res.send('test')
})

router.get('/user', function(req, res) {
	var userQuery = new Parse.Query("User");
	userQuery.find({
		success: function(users) {
			res.render('user', {
				users: users
			});
		}
	});
})

function Url(company) {
	var result = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22";
	result = result + company + "%22)%0A%09%09&format=json&diagnostics=true&env=http%3A%2F%2Fdatatables.org%2Falltables.env&callback=";
	return result
}

function Get(yourUrl){
	var Httpreq = new XMLHttpRequest(); // a new request
	Httpreq.open("GET",yourUrl,false);
	Httpreq.send(null);
	return Httpreq.responseText;
}

module.exports = router;
