const mongoose = require('mongoose');
const seller = mongoose.model('seller' , new mongoose.Schema({
    name : {type : String},
    sellerId : {type : String , unique : true },
    password : {type : String },
    orders : [
        {
            productId : {
                type : String
            },
            customerId : {
                type : String,
            },
            customerPhone : {
                type : String,
            },
            customerAddress : {
                type : String,
            },
            status : {
                atSellerHub : {
                    type : Boolean , default : true,
                },
                inTransit : {
                    type : Boolean, default : false,
                },
                usersHub : {
                    type : Boolean, default : false,
                },
                outofDelivery : {
                    type : Boolean, default : false,
                },
            }
        }
    ],
    sellerReview : [
        {
            sellerReview : {
                type : String,
            },
            sellerRating : {
                type : String,
            }
        }
    ]
}));

module.exports  = seller;