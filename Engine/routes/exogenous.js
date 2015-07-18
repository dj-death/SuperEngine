var exogenous = function (req, res, next) {
    var status, data;
    console.log(req.body);
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