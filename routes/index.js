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

router.get('/joinGame', function(req, res){
	var userQuery = new Parse.Query("User");
	var gameQuery = new Parse.Query("Game");
	userQuery.find().then(function(users){
		gameQuery.find().then(function(games){
			res.render('joinGame', {
				games: games,
				users: users
			});			
		});
	});
})

router.post('/joinGame', function(req, res){
	var NewTransaction = Parse.Object.extend("Transaction");
	var newTransaction = new NewTransaction();
	var userQuery = new Parse.Query("User");
	var gameQuery = new Parse.Query('Game');
	userQuery.get(req.body.user_id).then(function(user){
		gameQuery.get(req.body.game_id).then(function(game){
			var currentPlayers = game.attributes.CurrentPlayers;
			currentPlayers.push(user.attributes.username);
			game.save({CurrentPlayers: currentPlayers});
				newTransaction.save({
					gameName: game.attributes.Name,
					userName: user.attributes.username,
					currentMoney: 100000
				}).then(function(transaction){
					var query = new Parse.Query('CurrentQuote');
					query.find().then(function(stocks){
						var stocksInHand = new Array();
						for (var i in stocks) {
							stocksInHand.push({
								share: '0',
								symbol: stocks[i].attributes.Symbol
								
							});
						}
						transaction.save({stocksInHand: stocksInHand});
					})
					res.send('done')
				});				
			//game.attributes.CurrentPlayers.push(user.attributes.username);

		});
	});
});

router.post('/quote', function(req, res){
	var stockname = req.body.stockname;
	var json_obj = JSON.parse(Get(Url(stockname)));
	var stock = json_obj.query.results.quote;
	res.render('stock', {stock: stock});
})

router.get('/test', function(req, res) {
	console.log(userStocksInitialize());
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

router.get('/time_check', function(req, res) {
	var query = new Parse.Query("CurrentQuote");
	query.find().then(function(stocks){
		var time1 = new Date(stocks[0].updatedAt);
		var time2 = new Date();
		var timeDifferences = (time2.getTime() - time1.getTime())/1000/60;
		console.log(time2.getTime() + " - " +time1.getTime() + " = ");
		console.log(timeDifferences);
		res.sendStatus(time2);
	})
})

router.get('/queryAllQuotes', function(req, res) {
	var query = new Parse.Query("CurrentQuote");
	var n = 0;
	var stockSymbols = "";
	query.find().then(function(stocks){
		for(var i in stocks) {
			if (n == 0) {
				stockSymbols = stocks[i].attributes.Symbol;
				n++;
			} else if (n == 1 || n == 2) {
				stockSymbols = stockSymbols + "%22%2C%22" + stocks[i].attributes.Symbol;
				n++;
			} else if (n == 3) {
				stockSymbols = stockSymbols + "%22%2C%22" + stocks[i].attributes.Symbol;
				var queryResults = JSON.parse(Get(Url(stockSymbols))).query.results.quote;
				for (var m =0; m < 4; m++) {
					stocks[i - m].save({QueryResult: queryResults[3 - m]}).then(function(){});
				}
				n = 0;
				stockSymbols = "";
			}
		}
		res.redirect('/');
	}, function(error){
		res.send(error);
	});
})

router.get('/listAllQuotes', function(req, res) {
	var query = new Parse.Query("CurrentQuote");
	query.find().then(function(results){
		var stocks = new Array();
		for (var i in results) {
			stocks.push({
				name: results[i].attributes.Name, 
				symbol: results[i].attributes.Symbol, 
				last_price: results[i].attributes.QueryResult.Bid,
				day_change: results[i].attributes.QueryResult.Change_PercentChange
			});
		}
		return stocks;
	}).then(function(stocks){
		res.render('stocks', {stocks: stocks});
	})
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
