const express = require("express");
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine','ejs');
const { spawn } = require('child_process');


// -------------Setting Up  Database------------------------
const mongoose = require('mongoose')
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/buyNowitems',{useNewUrlParser : true}); 
    console.log("Database Connected");
}
mongoose.set('strictQuery', true);
const item = require("./models/item")
const seller = require("./models/seller");
const user = require("./models/user");

////////////////////////////////////////////////////////////////////////////////////////////////////////////

// name , email , password , 
// Registration Form
app.get('/register',function(req,res){
    res.render('registration');
    console.log(req.body);

    const ujjwal = new user({
        name : 'Ujjwal',
        email : 'ujjwal@gmail.com',
        password : 'abc123',
        orders : ['112345678' , 'abc12345' , '11112dd121'],
    });
})


// //////////////////////ByDefaultLoginFormOpens////////////////////////////
app.get('/',async function(req,res)
{    
    res.render('login');
})

app.post('/login',function(req,res){
    console.log(req.body);
    const email = req.body.email;
    const password = req.body.password;

    user.findOne({email : email , password : password}, '_id',function(err,accept){
        if(!err && accept){
            console.log("User Found");
            const userId = accept.id;
            res.render('search',{userId})
        }
    })

})

app.get('/sellerRegister' , function(req,res){
    res.render('sellerRegister');
})



app.post('/regis',function(req,res){
    if(req.body.password[0]===req.body.password[1]){
        console.log("Password is Matched");
    }
    const newUser = new user({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password2,
        orders : [],
    });

    newUser.save(function(err , result){
        if(!err && result){
            console.log(result);
            console.log("Registration Successful");
            res.render('registrationSuccessful');
        }
    })
});

app.post('/registerNew',function(req,res){
    res.render('registration')
})

//////////////////////////////////////////////////////////////////////
app.get('/search',function(req,res){
    const userId= req.params.id;
    // res.render('search',{userId})
    // console.log(req.body);
    console.log(req.params);
    // res.redirect(`/search?id=${userId}`);
})

app.post('/regisseller' , function(req,res){
    console.log(req.body);
    const newUser = new seller({
        name : req.body.name,
        sellerId : req.body.sellerid,
        password : req.body.password,
    });
    newUser.save(function(err,saved){
        if(!err && saved){
            console.log(saved);
        }
    })
})

//    Yha se Error ko dekho
app.post('/search',async function(req,res){

    const getUserId = req.body.userId;
    const myItem = req.body.searchItem;
    console.log(myItem);
    if(myItem!=null && myItem!=undefined){
            const getitem =  item.find({name: myItem},function(err,result){
                console.log(result);
                if(!err){
                    if(result!=[] || result!=null || result!=undefined){
                        console.log(result);
                        res.render('buyer',{ItemName : myItem , getData : result , getUserId});
                    }
                    else{
                        res.render('productnotfound');
                    }
                }
        });
   }
   else{
        const getitem =  item.find({name: myItem},function(err,result){
            console.log(result);
            if(!err){
                if(result!=[] || result!=null || result!=undefined){
                    console.log(result);
                    res.render('buyer',{ItemName : myItem , getData : result , getUserId});
                }
                else{
                    res.render('productnotfound');
                }
            }
    });
   }
})

// Setting up for client seller chat    Check and Fix the Code
app.post('/contact' , function(req,res){
    res.render('index');


})

// Set Up the Chat Feature as soon as possible
app.get('/contact' , function(req,res){
    // console.log(__dirname);
    // res.sendFile(__dirname + '/index.html');
    res.render('index');                // temporary change
})

app.get('/seller',function(req,res){
    res.render('seller');
})

app.get('/addData',function(req,res){
    res.render('addData');
})

app.post('/updateData' , function(req,res){
    console.log(req.body);
    res.send('<h1>The Data has been received.</h1>');
    const newProduct = new item({
            name : req.body.productName,
            sellerName : req.body.sellerName,
            sellerID : req.body.sellerId,
            productDetails : req.body.productDetails,
            price : req.body.productPrice,
        })
        newProduct.save(function(err,accept){
            if(!err && accept){
                console.log(accept);
            }
        })
})

app.get('/buynow',function(req,res){
    res.render('buynow');
    console.log(req.body);
})


app.post('/:productId/:userId',async function(req,res){
    let getId = req.params.productId;
    getId = getId+"";

    let userId = req.params.userId;
    userId = userId+"";

    console.log("Product Id "+getId);
    console.log("User ID "+userId);


    const getData = await item.findById(getId,function(err,result){
        // console.log(result.name);
        console.log(result);
        res.render('buynow',{ getId , userId,product : result})
    });
})

app.post('/order/:productId/:userId/:sellerID' , function(req,res){
    // res.send('<h1>Your Order is successful</h1>');
    let myproductID = req.params.productId+"";
    let mycustomerID = req.params.userId+"";
    let mysellerID = req.params.sellerID+"";
    console.log(req.body);

    let address = req.body.address;
        address = address+"";
    let phonenumber = req.body.phonenumber;
        phonenumber = phonenumber+"";

    seller.find({sellerId : mysellerID} , function(err,result){
        if(!err && result){
            console.log("Seller Found");
            console.log(result);
        }
        else{
            console.log("Seller Not found");
        }
    })
    const orderData = {
        productId : myproductID,
        customerId : mycustomerID,
        customerPhone : phonenumber,
        customerAddress : address,
    }
    console.log(orderData);


    let orders = [{
        orderId : myproductID,
        orderstatus : {
            atSellerHub : true,
            inTransit : false,
            usersHub : false,
            outofDelivery : false,
        }
    }
    ]
    
    // updating Users Order data
    user.findOneAndUpdate(
        { _id : mycustomerID }, 
        { $push: { userorders: orders } },
       function (error, success) {
             if (error || !success) {
                 console.log(error);
             } else {
                 console.log(success+"User Order Data Updated");
             }
         });
// -----------_---------_----------_--------------_---------------------
    seller.findOneAndUpdate(
        { sellerId : mysellerID }, 
        { $push: { orders: orderData  } },
       function (error, success) {
             if (error || !success) {
                 console.log(error);
             } else {
                 console.log(success+"Seller Data Updated");
                res.render('orderSuccess',{ myproductID , mysellerID });
             }
         });


    // console.log(req.body);
})

app.post('/review',function(req,res){
    let sellerID = req.body.sellerId;
        sellerID = sellerID+"";
    
    console.log('====================================');
    console.log(req.body);
    console.log('====================================');

    let productID = req.body.productId;
        productID = productID+"";

    // let seller-rating = req.
    let productreview = req.body.productReview;
        productreview = productreview+"";

    let sellerreview = req.body.sellerReview;
    sellerreview = sellerreview+"";

    let sellerrating = req.body.sellerRating;
    sellerrating = sellerrating+"";

    let productrating = req.body.productRating;
    productrating = productrating+"";
    console.log(req.body);



    console.log("Reviews Accepteds");
    seller.updateOne(
        { sellerId: sellerID }, 
        { $push: { sellerReview: { sellerReview: sellerreview, sellerRating: sellerrating } } },
        (err, res) => {
          if (err) throw err;
          console.log(res);
        }
      );


    //   --------------BSON Error----------------------
    //   var id = mongoose.Types.ObjectId(productID);
        var hex = /[0-9A-Fa-f]{6}/g;
        id = (hex.test(productID))? ObjectId(productID) : productID;
      item.updateOne(
        { _id: id },
        { 
          $push: {
            productreviews: productreview,
            sellerreviews: sellerrating,
          } // push the new data to the productreviews and sellerreviews arrays
        },
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log(result);
          }
        }
      );

})

// ---------------------Constructing-Seller-Login ----------------------
app.get('/sellerLogin',function(req,res){
        const tempSeller = new seller({
        name : "seller01",
        sellerId : "bnow001",
        password : 'bnow001',
        orders : [],
        sellerReview : [],
    })

    // tempSeller.save();
    res.render('sellerLogin');
})

app.post("/sellerlogin" , function(req,res){
    let sellerID = req.body.sellerId;
    let sellerPassword  = req.sellerPassword;
    seller.findOne({sellerId : sellerID} , function(err, success){
        if(!err && success){
            console.log(success);
            console.log("Seller Found");
            console.log(success.sellerId);
            res.render('sellerHome', {sellerID : success.sellerId});
        }
        else{
            res.send('<h1>Seller Not Found</h1>')
        }
    })
})

app.get('/sellerHome' , function(req,res){
    res.render('sellerHome');
    let sellerId = req.query;
        sellerId = sellerId+"";
    console.log(sellerId);

})

app.get('/updateOrder',function(req,res){
    console.log(req.query);
    let sellerID = req.query.id;
        sellerID = sellerID+"";
    console.log(sellerID);
    seller.findOne({sellerId : sellerID} ,  function(err,success){
        if(!err && success){
            console.log(success);
            res.render('updateOrder',{seller : success});
            // res.render('updateOrder');
        }
    })
})

// get request for updating the transit status of the order 
app.get('/updateTransit',function(req,res){
    let sellerId = req.query.arg1;
        sellerId = sellerId+"";
     let productID= req.query.arg2;
        productID = productID+"";
     let customerID= req.query.arg3;
        customerID = customerID+"";
     console.log("sellerId "+sellerId);
     console.log("productId "+productID);
     console.log("customerId "+customerID);
    //  seller.find({sellerID : sellerId }, function(err , success){
    //     console.log(success);
    //  })
    res.render('updateTransit' , {sellerId , customerID , productID })
})

app.post('/transitUpdate' ,async function(req,res){
    console.log(req.body);
    let sellerID = req.body.sellerId;
        sellerID = sellerID+"";
    let productID = req.body.productId;
        productID = productID+"";
    let customerID = req.body.customerId;
        customerID = customerID+"";
    const selectedDeliveryStatus = req.body.delivery_status;
    console.log(selectedDeliveryStatus);

      const getSeller = await seller.findOne(
        { sellerId: sellerID, 'orders.productId': productID },
      )
      console.log(getSeller);
    //   console.log(getSeller.orders[0]._id);

    let myorderId = getSeller.orders[0]._id;

    let a = false;
    let b = false;
    let c = false;
    let d = false;
    if(selectedDeliveryStatus.includes('atSeller')){ a = true;}
    if(selectedDeliveryStatus.includes('inTransit')){ b = true;}
    if(selectedDeliveryStatus.includes('usersHub')){ c = true;}
    if(selectedDeliveryStatus.includes('outofDelivery')){ d = true;}
    console.log(a);
    console.log(b);
    console.log(c);
    console.log(d);
      const orderId = myorderId;
        const statusToUpdate = {
        atSellerHub: a,
        inTransit: b,
        usersHub: c,
        outofDelivery: d,
        };

        seller.findOneAndUpdate(
        { "orders._id": orderId },
        { $set: { "orders.$.status": statusToUpdate } },
        (err, updatedSeller) => {
            if (err) {
            console.error(err);
            return;
            }
            console.log(updatedSeller);
        }
        );


        const userId = customerID; 
        const userorderId = orderID; 
        console.log(userId);
        console.log(userorderId);


        const update = {
        $set: {statusToUpdate}
        };

        console.log(update);

        const options = {
        arrayFilters: [{ 'elem.orderId': userorderId }]}
        

        console.log(options);

        const result = await user.updateOne({ _id: userId }, update, options);
        console.log(result);
        res.render('lastPage');
})



// Adding Tracking Option

app.get('/trackOrder' , function(req,res){
    res.render('orderTracking');
}) 

app.post('/orderTrack' , function(req,res){
    console.log(req.body);
    console.log('====================================');
    console.log("Tracking Order");
    console.log('====================================');
    let orderNo = req.body.orderNumber;
    orderNo = orderNo+"";

    const orderIdToFind = orderNo; 

    user.findOne({ 'userorders.orderId': orderNo }, (err, doc) => {
    if (err) {
        res.send('<h1>The Order Does not exist</h1>')
        console.log(err);
    } else {
    const orderStatus = doc.userorders[0].orderstatus;
        console.log(orderStatus);
        let val = 20;
        let lastData = "";
        if(orderStatus.atSellerHub==true){
            val = 25; lastData = "At Seller Hub"
        }
        else if(orderStatus.inTransit == true){
            val = 50; lastData = "Under Transit";
        }
        else if(orderStatus.usersHub==true){
            val = 80 ; lastData = "At your Nearest Hub ";
        }
        else if(orderStatus.outofDelivery==true){
            val = 90 ; lastData = "Out Of Delivery ";
        }
        else{
            val = 100 ; lastData = "Delivered";
        }
        res.render('track' , {orderNo , lastData , val})
    }
    });

}) 

// Setting again for reviews (already the file has been mage but this is for satisfaction)

app.get('/rateNreview',function(req,res){
    res.render('ratenReview');
})
app.post('/updateReviews' , async function(req , res){
    console.log(req.body);
    let getSellerID = req.body.sellerId;
        getSellerID =  getSellerID+"";
    let getProductID = req.body.productId;
        getProductID = getProductID+"";
    console.log('====================================');
    console.log("Product Id is "+getProductID);
    console.log('====================================');
    let review = req.body.review;
        review = review+"";
    let rating = req.body.rating;
        rating = rating+"";
    let getItem = await item.findById(getProductID);
    getItem = getItem.productreviews.push(review);
    // getItem.productreviews.save();

    item.findById(getProductID, function(err, foundItem) {
    if (err) {
        console.log(err);
    } else {
        foundItem.productreviews.push(review);
        foundItem.save(function(err, updatedItem) {
        if (err) {
            console.log(err);
        } else {
            console.log(updatedItem);
        }
        });
    }
    });

})


app.get('/track' , function(req,res){
    res.render('track');
})

app.listen(3000,function()
{
    console.log("Server Has Started On Port 3000");
})

app.get('/', (req,res)=>{
   res.send('Hello')
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server up and running on port ${5000}`);
})