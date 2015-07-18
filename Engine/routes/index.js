/*
 * GET home page.
 */
var express = require('express');
var apiRouter = express.Router();
var decisions = require('./decisions');
var results = require('./results');
var simulation = require('./simulation');
var preprocess = require('./preprocess');
var exogenous = require('./exogenous');
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
module.exports = apiRouter;
//# sourceMappingURL=index.js.map