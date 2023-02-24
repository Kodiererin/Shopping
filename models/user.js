const mongoose = require('mongoose');
const user = mongoose.model('user',new mongoose.Schema({
    name : {
        type : String,
    },
    email : {
        type : String,
    },
    password : {
        type : String,
    },
    userorders : [{
        orderId : {type : String},
        orderstatus : {
            atSellerHub : {
                type : Boolean , default : false,
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
}));

module.exports = user;