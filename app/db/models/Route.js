var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var routeSchema = new Schema({
    name: String,
    geometry : {
        type: {type: String},
        coordinates : {
            type : [],
            required: true
        }
    }
});

routeSchema.index({geometry: '2dsphere'});

mongoose.model('Route', routeSchema);
