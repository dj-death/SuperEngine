/*
 * GET home page.
 */
var express = require('express');
var apiRouter = express.Router();


import decisions = require('./decisions');
import results = require('./results');
import simulation = require('./simulation');
import preprocess = require('./preprocess');
import exogenous = require('./exogenous');

import console = require('../utils/logger');


/*
if (error) {
    res.status(status || 500);

    res.send({
        title: '500 System Error',
        message: message
    });
}
*/
apiRouter.all('/analyze', function (req, res, next) {
    preprocess.analyze.apply(null, [req, res, next]);
});


apiRouter.all('/initialize', function (req, res, next) {
    preprocess.initialize.apply(null, [req, res, next]);
});

apiRouter.post('/decisions', function (req, res, next) {
    decisions.apply(null, [req, res, next]);
});

apiRouter.all('/simulation', function (req, res, next) {
    simulation.run.apply(null, [req, res, next]);
});

apiRouter.get('/results', function (req, res, next) {
    results.apply(null, [req, res, next]);
});

apiRouter.all('/exogenous', function (req, res, next) {
    exogenous.apply(null, [req, res, next]);
});

apiRouter.get('/historique', function (req, res, next) {
    preprocess.historique.apply(null, [req, res, next]);
});



export = apiRouter;