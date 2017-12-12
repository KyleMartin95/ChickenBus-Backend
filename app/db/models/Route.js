const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;

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
        cost: {type: Currency},
        //stored as UTC
        departureTimes: {
            sunday: [String],
            monday: [String],
            tuesday: [String],
            wednesday: [String],
            thursday: [String],
            friday: [String],
            saturday: [String]
        },
        duration: Number,
        notes: String,
        approved: {
            type: Boolean,
            required: true,
            default: false
        }
    }
});

routeSchema.index({geometry: '2dsphere'});

mongoose.model('Route', routeSchema);
