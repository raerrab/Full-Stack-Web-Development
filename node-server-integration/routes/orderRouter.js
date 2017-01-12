var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Dishes = require('../models/orders');
var Verify = require('./verify');

var orderRouter = express.Router();

orderRouter.use(bodyParser.json());

orderRouter.route('/')
    .all(Verify.verifyOrdinaryUser)
    .get(function(req,res,next){
            console.log('User Id is:'+req.decoded._id);
            Orders.findOne({'postedBy':req.decoded._id})
                .populate('postedBy')
                    .exec(function (err, order) {
            if (err) throw err;
            res.json(order);
        });
    })
    .post(function(req, res, next){
            req.body.postedBy=req.decoded._id;
            req.body._id=mongoose.Types.ObjectId();
            console.log('User Id is: '+req.decoded._id+' req.body._id (generated): '+req.body._id+' req.body.postedBy: '+req.body.postedBy);
            console.log(req.body);
            Orders.create(req.body, function (err, order) {
            if (err) throw err;
            console.log('Order created!');
            var id = order._id;
            /*res.writeHead(200, {
            Content-Type': 'text/plain'
            });*/

            console.log('Added the order with id: ' + id);
            res.json(order);
            });
    });

module.exports = orderRouter;