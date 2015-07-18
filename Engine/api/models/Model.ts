var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;


class Model {
    protected Mongoose = Mongoose;
    protected Schema = Schema;
    protected Model;

    constructor(private name, private schema) {
        this.Model = Mongoose.model(name, schema);
    }

    get query(): any {
        return this.Model;
    }

}

export = Model;