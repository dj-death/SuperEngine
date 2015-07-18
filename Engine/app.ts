var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

import fs = require('fs');
import http = require('http');
import path = require('path');

import logger = require('./utils/logger');
import router = require('./routes/index');
import config = require('./config');

var app = express();


var morganFileStream = fs.createWriteStream('./accessmorgan.log', { 'flags': 'a' });
var morganOption = {
    skip: function (req, res) { return res.statusCode < 400; }
};


if (app.get('env') === 'production') {
    app.use(morgan('dev', morganOption));
} else {
    app.use(morgan('dev'));
}

var whitelist = ['http://localhost:1841', 'http://localhost:1337'];
var corsOptions = {
    origin: function (origin, callback) {
        var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        callback(null, originIsWhitelisted);
    }
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', router);


// catch 404 and forwarding to error handler
app.use(function (req, res, next) {

    res.status(404);
    res.send({ message: '404 Not found! URL: ' + req.url });

});



app.use(function (err, req, res, next) {
    // we may use properties of the error object
    // here and next(err) appropriately, or if
    // we possibly recovered from the error, simply next().



    if ((typeof err.message !== 'undefined' && err.message.toLowerCase().substr(0, 6) == 'cancel') || typeof err.errorCode !== 'undefined') {
        // respond promise stop chains info with no system error

        console.log('400 Error. ', 'Message:', err.message);

        res.status(err.status || 400);

        res.send({
            title: '400 Data Error',
            message: err.message,
            errorCode: err.errorCode
        });

    } else {
        // respond 500 system error
        logger.error(err);

        res.status(err.status || 500);

        res.send({
            title: '500 System Error',
            message: err.message
        });

        return;

    }

});


var server_port = process.env.OPENSHIFT_NODEJS_PORT || config.port;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || config.ip;

var server = app.listen(server_port, server_ip_address, function () {
    console.log('Express server listening on port ' + server.address().port);
});




mongoose.connect(config.mongo_conn);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (response, request) {
    
});




