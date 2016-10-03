var express = require('express'),
  bodyParser = require('body-parser'),
	request = require('request'),
	//async = require('async'),
	app = express();

app.set('port', 3001);
app.listen(app.get('port'));

app.use(bodyParser.urlencoded({
  extended: true
}));


// respond with "hello world" when a GET request is made to the homepage
app.get('/', function(req, res) {
  res.send('hello world');
});

function reply(res){
  res.status(201).send('Task Added');
}

app.post('/task',function(req,res){
  console.log(req.body);
  setTimeout(function(){
    reply(res);
  }, 5000);
});

app.get('/payme', function(req, res){
	res.json();
});

//Basic the REST API calls
app.get('/myfirstapicall', function(req, res) {

	request.get('https://api.blockcypher.com/v1/btc/main/txs/f854aebae95150b379cc1187d848d58225f3c4157fe992bcd166f58bd5063449', {timeout: 1500}, function(err, response, body) {
	 if(response.statusCode == 200){
        // console.log('document saved as: http://mikeal.iriscouch.com/testjs/'+ rand)
        console.log(body);
        res.json(body);
      } else {
        console.log('error: '+ response.statusCode);
        console.log(body);
        res.status(400).send('Bad Request');
      }
	});

  // request(
  //   { method: 'GET'
  //   , uri: 'http://mikeal.iriscouch.com/testjs/' + rand
  //   , multipart:
  //     [ { 'content-type': 'application/json'
  //       ,  body: JSON.stringify({foo: 'bar', _attachments: {'message.txt': {follows: true, length: 18, 'content_type': 'text/plain' }}})
  //       }
  //     , { body: 'I am an attachment' }
  //     ]
  //   }
  // , function (error, response, body) {
  //     if(response.statusCode == 201){
  //       console.log('document saved as: http://mikeal.iriscouch.com/testjs/'+ rand)
  //     } else {
  //       console.log('error: '+ response.statusCode)
  //       console.log(body)
  //     }
  //   }
  // );
});
