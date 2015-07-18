import Model = require('./Model');
import seminarSchema = require('../schemas/Seminar');

var Q = require('q');

class SeminarModel extends Model {
    static name = "Seminar";
    static schema = seminarSchema;

    constructor() {
        super(SeminarModel.name, SeminarModel.schema);
    }

}

var SM = new SeminarModel();

export = SM;