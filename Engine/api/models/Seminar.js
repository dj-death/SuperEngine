var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Model = require('./Model');
var seminarSchema = require('../schemas/Seminar');
var Q = require('q');
var SeminarModel = (function (_super) {
    __extends(SeminarModel, _super);
    function SeminarModel() {
        _super.call(this, SeminarModel.name, SeminarModel.schema);
    }
    SeminarModel.name = "Seminar";
    SeminarModel.schema = seminarSchema;
    return SeminarModel;
})(Model);
var SM = new SeminarModel();
module.exports = SM;
//# sourceMappingURL=Seminar.js.map