const mongoose = require('mongoose');

const item = mongoose.model('item' ,new mongoose.Schema({
    name : {
        type : String,
        uppercase : true,
    },
    sellerName : {
        type : String,
        boolean : true,
    },
    sellerID : {
        type : String,
        required : true,
    },
    productDetails : {
        type : String,
    },
    productreviews : {
        type : Array,
        default : [String],
    },
    sellerreviews : {
        type : Array,
        default : [String],
    },
    price : {
        type : Number,
        minimum : 0,
        required : true,
    },
}));

module.exports = item;