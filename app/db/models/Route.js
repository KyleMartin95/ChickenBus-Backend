const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var routeSchema = new Schema({
    type: String,
    geometry : {
        type: {type: String},
        required: false,
        coordinates : {
            type : []
        }
    },
    properties: {
        name: String,
        cost: Number
    }
});

routeSchema.index({geometry: '2dsphere'});

mongoose.model('Route', routeSchema);
