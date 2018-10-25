const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// New schema will require manual data points for coordinates of logged stops
//  - name of stop
//  - coordinates
//  - information?
//
// Associative information
//  - routes that stop at these stops

// var stopSchema = new Schema({
//     type: String,
//     geometry: {
//         type: {type: String},
//         coordinates: {
//             type: [],
//             required: true
//         }
//     },
//     properties: {
//         routes: {
//             type: [mongoose.Schema.Types.ObjectId],
//             ref: 'Route'
//         },
//         approved: {
//             type: Boolean,
//             required: true,
//             default: false
//         }
//     }
// });

mongoose.model('dataType', dataSchema);
