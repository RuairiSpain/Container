var express = require('express');
var app = express();
var mongoose = require('mongoose');

//DB setup
mongoose.connect('mongodb://mongo:27017');

app.get('/', function(req, res) {
    res.send('Hello World');
});


app.listen(process.env.PORT || 3000, function() {
    console.log('Example app listening on port 3000!');
});