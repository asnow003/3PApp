var express = require('express');
var app = express();
var path = require('path');


// Initialize variables.
var port = 1530;

app.use("/js", express.static(path.join(__dirname, "js")));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/index.html', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

// Start the server.
app.listen(port);
console.log('Listening on port ' + port + '...'); 