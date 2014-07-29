
var express = require('express');
var app = express();


app.use(express.static(__dirname + '/'));
// app.use(express.static("/Users/paulguerra/Projects/xmpp-inspector/"));
//app.use("/assets/cabin", express.static("/Users/paulguerra/Projects/Eikon/Chat/www/assets/cabin"));


app.get('/json/get/', function(req, res) {
  // console.log(req.route.path);
  res.sendfile(__dirname + '/sample.json');
});

app.post('/json/post/', function(req, res) {
  // console.log(req.route.path);
  res.sendfile(__dirname + '/sample.json');
});

app.post('/nhttp-bind/', function(req, res) {
  // console.log(req.route.path);
  res.sendfile(__dirname + '/sample.xml');
});

app.get('/', function(req, res) {
  console.log(req.route.path);
  res.sendfile(__dirname + '/index.html');
});

// app.get('/jquery-1.11.0.min.js', function(req, res) {
//   console.log(req.route.path);
//   res.sendfile(__dirname + '/jquery-1.11.0.min.js');
// });

// app.get('/google-code-prettify/src/run_prettify.js',function(req, res) {
//    console.log(req.route.path);
// });

var port = 1979;
app.listen(port);
console.log("listening on localhost:" + port, __dirname);