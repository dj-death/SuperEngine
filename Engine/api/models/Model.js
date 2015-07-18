var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;
var Model = (function () {
    function Model(name, schema) {
        this.name = name;
        this.schema = schema;
        this.Mongoose = Mongoose;
        this.Schema = Schema;
        this.Model = Mongoose.model(name, schema);
    }
    Object.defineProperty(Model.prototype, "query", {
        get: function () {
            return this.Model;
        },
        enumerable: true,
        configurable: true
    });
    return Model;
})();
module.exports = Model;
//# sourceMappingURL=Model.js.map