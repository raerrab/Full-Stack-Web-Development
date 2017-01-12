// grab the things we need
var mongoose = require('mongoose');
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;

var Schema = mongoose.Schema;

// create a schema
var orderSchema = new Schema({
    dishes: [ {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true,
            unique: true
        },
        price: {
            type: Currency,
            required: true
        },
        image: {
            type: String,
            required: true
        }
    }
    ],
    sum: 
    {
        type: Currency,
        required: true
    },
    postedBy: 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},
{
        timestamps: true
});
    
// the schema is useless so far
// we need to create a model using it
var Orders = mongoose.model('Order', orderSchema);

// make this available to our Node applications
module.exports = Orders;