var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var routeSchema = new Schema({
    type: {type: String},
    geometry : {
        type: {type: String},
        coordinates : {
            type : [Number],
            index : '2dsphere',
            required: true
        }
    },
    properties : {
        name : String
    }
});

mongoose.model('Route', routeSchema);
