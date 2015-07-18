var winston = require('winston');
winston.add(winston.transports.File, { filename: './appwinston.log' });
//winston.remove(winston.transports.Console);
function error(err) {
    if (!err)
        return;
    if (err.message) {
        winston.info("System Error: ", err.message);
    }
    if (err.stack) {
        winston.info(err.stack);
    }
}
exports.error = error;
function log() {
    var rest = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        rest[_i - 0] = arguments[_i];
    }
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift("Debug Info: ");
    winston.info.apply(this, args);
}
exports.log = log;
function info() {
    var rest = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        rest[_i - 0] = arguments[_i];
    }
    log.apply(null, arguments);
}
exports.info = info;
//# sourceMappingURL=logger.js.map