const mongoose = require('mongoose');
const Route = mongoose.model('Route');

module.exports = {

    find: (req, res) => {
        Route.find({}, function(err, routes){
            if(err){
                console.log(err);
                res.send(err);
            }else{
                res.json(routes);
            }
        });
    },

    create: (req, res) => {
        //for test purposes for now
        Route.create({
            name: 'New Test',
            geometry: {
                type: 'LineString',
                coordinates: [
                    [
                        -86.3,
                        12.3
                    ],
                    [
                        86.1,
                        13.1
                    ],
                    [
                        86.0,
                        13.0
                    ]
                ]
            }
        }, function(err,route){
            if(err){
                console.log(err);
                res.send(err);
            }else{
                res.json(route);
            }
        });
    }
};
