var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Verify = require('./verify');

var Favorites = require('../models/favorites');

var favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .all(Verify.verifyOrdinaryUser)
        .get(function(req,res,next){
            console.log('User Id is:'+req.decoded._id);
            Favorites.findOne({'postedBy':req.decoded._id})
                .populate('postedBy dishes')
                    .exec(function (err, favorite) {
            if (err) throw err;
            res.json(favorite);
        });
})
        .post(function(req, res, next){
            Favorites.findOne({'postedBy':req.decoded._id}, function (err, favorite) {
                if (err) throw err;
                if (favorite==null) 
                {
                    /* we need to remove _id and stick it in as dish to be added. If that is not done the _id will be the _id for
                       the document (favorite) we are inserting. Generate a new ObjectId for this document */
                    var _dishId = req.body._id;
                    delete req.body._id;
                    req.body._id=mongoose.Types.ObjectId();
                    req.body.dishes = _dishId;
                    req.body.postedBy=req.decoded._id;
                    console.log('User Id is: '+req.decoded._id+' req.body._id (generated): '+req.body._id+' req.body.postedBy: '+req.body.postedBy+' req.body.dishes: '+req.body.dishes);
                    
                    Favorites.create(req.body, function (err, favorite) {
                        if (err) throw err;
                        console.log('Favorite created!');
                        var id = favorite._id;
                        /*res.writeHead(200, {
            '               Content-Type': 'text/plain'
                        });*/

                        console.log('Added the favorite with id: ' + id);
                        res.json(favorite);
                    });
                }
                else 
                {
                    /* we need to remove _id and stick it in as dish to be added. If that is not done the _id will be the _id for
                       the document (favorite) we are inserting. Populate the _id from favorite */
                    var _dishId = req.body._id;
                    delete req.body._id;
                    req.body._id = favorite._id;
                    console.log('User Id is: '+req.decoded._id+' req.body._id: '+req.body._id+' _dishId: '+_dishId);
                    favorite.dishes.push(_dishId);
                    favorite.save(function (err, favorite) {
                        if (err) throw err;
                        console.log('Updated Favorites!');
                        res.json(favorite);
                    });       
                }
        });

    })
    .delete(function(req, res, next){
        console.log('User Id is:'+req.decoded._id);
        Favorites.remove({'postedBy':req.decoded._id}, function (err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    });

    favoriteRouter.route('/:dishId')
        .all(Verify.verifyOrdinaryUser)
            .delete(function(req, res, next){
                Favorites.findOne({'postedBy':req.decoded._id}, function (err, favorite) {
                    if (err) throw err;
                    var i=0;
                    var updatedFavs=[];                
                    while(i<favorite.dishes.length) {
                        if(favorite.dishes[i].equals(req.params.dishId)) 
                        {
                            console.log('Dish to be deleted: '+favorite.dishes[i]);
                        }
                        else
                        {
                            updatedFavs.push(favorite.dishes[i]);
                        }
                        i++;
                    }
                    
                    /*
                        for(var t=0;t<updatedFavs.length;t++)
                            console.log(updatedFavs[t]);
                    */
                    favorite.dishes.remove();
                    favorite.dishes=updatedFavs;
                    favorite.save(function (err, favorite) {
                        if (err) throw err;
                        console.log('Updated Favorites!');
                        res.json(favorite);
                    });
                });
                    
        });

module.exports = favoriteRouter;