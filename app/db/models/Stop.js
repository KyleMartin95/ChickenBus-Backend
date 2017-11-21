const mongoose = require('mongoose');
const Route = mongoose.model('Route');
const Schema = mongoose.Schema;

var stopSchema = new Schema({
    type: String,
    geometry: {
        type: {type: String},
        coordinates: {
            type: [],
            required: true
        }
    },
    properties: {
        routes: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Route'
        },
        approved: {
            type: Boolean,
            required: true,
            default: false
        }
    }
});

stopSchema.index({geometry: '2dsphere'});

mongoose.model('Stop', stopSchema);
