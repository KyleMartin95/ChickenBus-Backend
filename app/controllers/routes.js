const mongoose = require('mongoose');
const Route = mongoose.model('Route');

module.exports = {

    find: (req, res) => {
        // Route.findOne({'properties.name': 'test'}, 'geometry.coordinates', function(err, route){
        //     res.json(route);
        // });

        Route.find({}, function(err, routes){
            res.json(routes);
        });
    },

    create: (req, res) => {
        Route.create({
            type: 'Feature',
            properties: {
                name: 'create test'
            },
            geometry: {
                type: 'LineString',
                coordinates: [
                    [
                        -86.25503540039061,
                        12.113935335754642
                    ]
                ]
            }
        }, function(err,route){
            if(err){
                console.log(err);
            }else{
                res.json(route);
            }
        });
    }
};
