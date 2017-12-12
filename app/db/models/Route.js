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
        cost: {type: Number},
        //stored as UTC
        departureTimes: {
            sunday: [Number],
            monday: [Number],
            tuesday: [Number],
            wednesday: [Number],
            thursday: [Number],
            friday: [Number],
            saturday: [Number]
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
