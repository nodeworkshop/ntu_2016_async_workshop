'use strict';

var IndexModel = require('../models/index'),
	async = require('async'),
	request = require('request');


module.exports = function (router) {

    var model = new IndexModel();

    router.get('/', function (req, res) {      
        res.render('index', model);  
    });

    //Basic the REST API calls
    //Lab 1.0
    //Fix the code below and use it to 
    // call this uri https://api.github.com/users/aeshanw

	router.get('/myfirstapicall', function (req, res) {

		request.get('https://api.github.com/users/aeshanw',
		  {
			timeout: 1500,
			headers: {
		    	'User-Agent': 'demoapp'
		    }
		}, function(err, response, body) {
		 if(response && response.statusCode == 200){
	        console.log('github response: %j', body);
	        res.send('Github call complete!');
	      } else {
	        console.log('error: '+ response.statusCode);
	        console.log(body);
	        res.status(400).send('Bad Request');
	      }
		});
	});

	var addTask =  function(taskName, cb){
		console.log("Task:"+taskName);
		 request.post('http://localhost:3001/task', {form:{taskName: taskName}, timeout: 30000}, function (err,response,body){
           if (err){
                 cb(err);
           } else {
                 cb(null, body); // First param indicates error, null=> no error
           }
     	});
	}


	//Async basics
	//Lab1.1a Async Series
	//Complete the code below to call the task API twice (one after another) in series
	//hint: use the function above to call the API e.g: addTask("Task1",callback);
	//After tasks are added console.log the results object returned and the error (if any)
	//Also after adding all tasks, print a msg using res.send('All Tasks added!');
	//hint console.log('Errors: %j',object); to print out object data to console log.

	router.get('/addtask', function (req, res) {
		async.series([
		    function(callback){
		        // task#1 API call
		        addTask("Task1",callback);
		    },
		    function(callback){
		        // task#2 API call
		        //refer to the example above
		        addTask("Task2",callback);
		    }
		],function(err, results){
			//After All tasks added
			//do something
			console.log('Errors: %j',err);
			console.log("results: %j",results)
			res.send('All Tasks added!');		
		});
	});

	//Async basics
	//Lab1.1b Async Parallel
	//Complete the code below to call the task API twice in parallel
	//use the hints given for Lab1.1a
	//After tasks are added console.log the results object returned and the error (if any)
	//Also after adding all tasks, print a msg using res.send('All Tasks added!');
	router.get('/addtask2', function (req, res) {
		async.parallel([
		    function(callback){
		        // task#1 API call
		        addTask("Task1",callback);
		    },
		    function(callback){
		        // task#2 API call
		        addTask("Task2",callback);
		    }
		],function(err, results){
			//All tasks added
			//do something
			console.log('Errors: %j',err);
			console.log("results: %j",results)
			res.send('All Tasks added!');
		});
	});

	//Lab 2.0 PayPal API Authentication
	//Replace the clientID & secret as per your registered PayPal Application
	//and replace pp-token-api uri below to the correct API to get the access_token from PP Dev portal
	function getAccessToken(callback){

		var clientID = 'your-client-id-goes-here',
			clientSecret = 'your-client-secret-goes-here',
			accessToken = '';

		//don't forget to call the right PP API for the accessToken
		//check that the HTTP method is correct as per POSTMAN
		request({
		  url: 'https://api.sandbox.paypal.com/v1/oauth2/token',
		  method: 'POST',
		  auth: {
		    user: clientID,
		    pass: clientSecret
		  },
		  form: {
		    'grant_type': 'client_credentials'
		  }
		}, callback);
	}

	router.get('/gettoken', function (req, res) {
		getAccessToken(function(err, response) {
		  var json = JSON.parse(response.body);
		  console.log('Error: %j',err);
		  //If you did it correctly you should the Access Token in the logs
		  console.log("Access Token:", json.access_token);
		  res.send('/oauth2/token call complete!');
		});
	});

	//Lab2.1 Vault-Card via request
	//Complete missing fields to call the API
	var addCardToVault =  function(CardDetails, accessToken, cb){
		console.log("Card: %j",CardDetails);
		var options = {
		  url: 'https://api.sandbox.paypal.com/v1/vault/credit-cards',
		  json: true,
    	  headers: {
           "content-type": "application/json",
          },
          body: JSON.parse(JSON.stringify(CardDetails)),
		  timeout: 5000,
		  auth: {
		    'bearer': accessToken
		  }
		};

		 request.post(options, function (err,response,body){
           console.log('Vault response: %j', response);
           console.log('vault error: %j',err);
           if (err){
                 cb(err);
           } else {
                 cb(null, body.id); // First param indicates error, null=> no error
           }
     	});
	}

	router.get('/addcard', function (req, res) {
		var card1 = {
		    "type": "visa",
		    "number": "4559537502816349",
		    "expire_month": "11",
		    "expire_year": "2018",
		    "first_name": "Betsy",
		    "last_name": "Buyer",
		    "billing_address": {
		        "line1": "111 First Street",
		        "city": "Saratoga",
		        "country_code": "SG",
		        "postal_code": "95070"
		    }
		};

		getAccessToken(function(err, response) {
		  var json = JSON.parse(response.body);
		  //If you did it correctly you should the Access Token in the logs
		  console.log("Access Token:", json.access_token);
		  var accessToken = json.access_token;
			addCardToVault(card1, accessToken ,function(err, cardToken){
				console.log('cardToken: '+cardToken);
				res.send('Card Added to Vault!');
			});
		});
	});

	//Lab2.2 Make payment with a vaulted-card token
	//Complete the missing fields below to make calls to the correct api

	var payWithToken =  function(SubTotal, Tax, Shipping, CardToken, accessToken, cb){
		console.log("CardToken: %j",CardToken);

		//copy the POSTMAN body as the transaction object
		//this will act as the base skeleton upon which we'll add more data
		var transaction = {
		  "intent":"sale",
		  "payer":{
		    "payment_method":"credit_card",
		    "funding_instruments":[
		      {
		        "credit_card_token":{
		          "credit_card_id":"CARD-8KX35458F2546803TK7XET7I"
		        }
		      }
		    ]
		  },
		  "transactions":[
		    {
		      "amount":{
		        "total":"3.27",
		        "currency":"SGD",
		        "details":{
		          "subtotal":"3.21",
		          "tax":"0.03",
		          "shipping":"0.03"
		        }
		      },
		      "description":"This is the payment transaction description."
		    }
		  ]
		};	

		//adding more parameters to the request dynamically
		transaction.payer.funding_instruments[0].credit_card_token.credit_card_id = CardToken;
		transaction.transactions[0].amount.details.subtotal = SubTotal;
		transaction.transactions[0].amount.details.tax = Tax;
		transaction.transactions[0].amount.details.shipping = Shipping;
		transaction.transactions[0].amount.total = (parseFloat(SubTotal) + parseFloat(Tax) + parseFloat(Shipping)).toFixed(2);

		//after all the changes above just log it to just check your tranasction looks valid
		console.log('transaction :%j',transaction);

		var options = {
		  url: 'https://api.sandbox.paypal.com/v1/payments/payment',
		  json: true,
    	  headers: {
           "content-type": "application/json",
          },
          body: JSON.parse(JSON.stringify(transaction)),
		  timeout: 9000,
		  auth: {
		    'bearer': accessToken
		  }
		};

		 //TODO Fix this request as per POSTMAN call
		 request.post(options, function (err,response,body){
           console.log('Payment response: %j', response);
           console.log('Payment error: %j',err);
           if (err){
                 cb(err);
           } else {
                 cb(null, body.id); // First param indicates error, null=> no error
           }
     	});
	}

	function accessTokenReceived(accessToken, res){
		var card1 = {
		    "type": "visa",
		    "number": "4559537502816349",
		    "expire_month": "11",
		    "expire_year": "2018",
		    "first_name": "Betsy",
		    "last_name": "Buyer",
		    "billing_address": {
		        "line1": "111 First Street",
		        "city": "Saratoga",
		        "country_code": "SG",
		        "postal_code": "95070"
		    }
		};

		var card2 = {
		    "type": "mastercard",
		    "number": "5281224630637226",
		    "expire_month": "01",
		    "expire_year": "2018",
		    "first_name": "Betsy",
		    "last_name": "Buyer",
		    "billing_address": {
		        "line1": "111 First Street",
		        "city": "Saratoga",
		        "country_code": "SG",
		        "postal_code": "95070"
		    }
		};

		//split the total payment value into 2
		var subtotal = (100.00/2).toFixed(2),
			tax = (0.50/2).toFixed(2),
			shipping = (0.60/2).toFixed(2);


		async.parallel([
		    function(callback){
		        // add card 1 to vault
		        addCardToVault(card1, accessToken, callback);
		    },
		    function(callback){
		        //TODO add card 2 to vault
		        addCardToVault(card2, accessToken, callback);
		    }
		],function(err, results){
			//All Cards Added to Vault!
			console.log('Cards Added to Vault!');
			console.log('Errors: %j',err);
			//logging the results will show the Card tokens returned
			console.log('Results: %j',results);

			async.parallel([
			    function(callback){
			    	//make payment with card 1 token
			    	payWithToken(subtotal,tax,shipping,results[0], accessToken, callback)
			    },
			    function(callback){
			    	//make payment with card 2 token
			    	payWithToken(subtotal,tax,shipping,results[1], accessToken, callback)
			    }
			], function(payErr, payResults){
				//All Payments complete!
				console.log('payResults: %j',payResults);
				res.send('Paid with cards');
			});

		});
	}

	router.get('/paywithvault', function (req, res) {

		getAccessToken(function(err, response) {
		  var json = JSON.parse(response.body);
		  //If you did it correctly you should the Access Token in the logs
		  console.log("Access Token:", json.access_token);
		  var accessToken = json.access_token;
		  accessTokenReceived(accessToken, res);
		});
	});

};
