var console = require('../utils/logger');
var exogenous = function (req, res, next) {
    var status, data;
    console.debug(req.body);
    var error = false;
    var message;
    if (!error) {
        message = "init_success";
    }
    data = {
        message: message
    };
    res.json(data);
};
module.exports = exogenous;
//# sourceMappingURL=exogenous.js.map