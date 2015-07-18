var winston = require('winston');

winston.add(winston.transports.File, { filename: './appwinston.log' });
//winston.remove(winston.transports.Console);


export function error(err) {
    if (!err) return;

    if (err.message) {
        winston.info("System Error: ", err.message);
    }
    if (err.stack) {
        winston.info(err.stack)
    }
}

export function log(...rest: any[]) {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift("Debug Info: ");
    winston.info.apply(this, args);
}

export function info(...rest: any[]) {
   log.apply(null, arguments);
}

