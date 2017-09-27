var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var routeSchema = new Schema({
    type: String,
    geometry : {
        type: {type: String},
        coordinates : {
            type : [],
            required: true
        }
    },
    properties: {
        
    }
});

routeSchema.index({geometry: '2dsphere'});

mongoose.model('Route', routeSchema);
