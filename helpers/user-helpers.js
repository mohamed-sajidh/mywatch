var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { response } = require('express');
// const { response } = require('../app');
var objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
const { options } = require('../app');
const { resolve } = require('path');
const { rejects } = require('assert');
//const { resolve } = require('path');
require('dotenv').config()
const client = require("twilio")(process.env.ACCOUNT_SID,process.env.AUTH_TOKEN);

var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});


var paypal = require('paypal-rest-sdk');
const { promises } = require('dns');
const { log } = require('console');
paypal.configure({
    'mode' : 'sandbox' , 
    'client_id' : 'AbaBu9RUZNTi4KG7J5KaSmm3oTzxsFzKh7NRg5f86LT4jjKpp6nwQGg6TaeWzUbYeffqQtSI_WgwyEXz',
    'client_secret' : 'EFOQw_azIjVa63H5W9MxxQxnd5iTueV-pjY54vh5fPdtbCzlCUnXoDfMPQga3Ta_C2jjSNNjo7Ylqj7a'
})


module.exports = {


    addUser: (user) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).insertOne(user).then((res) => {
            })
        })
    },



    doSignup: (userData) => {
        userData.isBlocked = false
        return new Promise(async (resolve, reject) => {

            let userMobile = await db.get().collection(collection.USER_COLLECTION).find({phone : userData.phone}).toArray()
            let userEmail = await db.get().collection(collection.USER_COLLECTION).find({email : userData.email}).toArray()

            let rejectResponse = {}

            if(userEmail.length > 0 && userEmail.length){
                rejectResponse.emailExists = true
                reject(rejectResponse)
            }

            else if(userMobile.length > 0){
                rejectResponse.mobileExists = true
                reject(rejectResponse)
            }

            else{

                userData.password = await bcrypt.hash(userData.password, 10)
                userData.confirmPassword = await bcrypt.hash(userData.confirmPassword, 10)
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((res) => {
                resolve(res)

            })

            }
           

        })

    },


    doLogin: (userData) => {

        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {

                        console.log("login success");
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("login failed");
                        reject({ status: false })
                    }
                })
            }
            else {
                console.log("login failed...................");
                reject({ status: false })

            }
        })
    },


    addToCart: (prodId, userId) => {
        let prodObj = {
            item: objectId(prodId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == prodId)
                if (proExist != -1) {



                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(prodId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }

                    ).then(() => {
                        resolve()
                    })

                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId) },
                            {

                                $push: { products: prodObj }

                            }
                        ).then((response) => {
                            resolve()
                        })
                }


            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [prodObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },


    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        user: 1
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        user: 1,
                        product: {
                            $arrayElemAt: ['$product', 0]
                        }
                    }
                }


            ]).toArray()
            resolve(cartItems)


        })
    },


    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                
                count = cart.products.length
            }
            resolve(count)
        })
    },

   
    changeProductQuantity: (details , product) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        let stock = product.stock

        return new Promise((resolve, reject) => {
                

                if (details.count == -1 && details.quantity == 1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart) },
                        {
                            $pull: { products: { item: objectId(details.product) } }
                        }
                    ).then((response) => {
                        resolve({ removeProduct: true })
                    })
                }
    
                else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }
    
                    ).then((response) => {
                        resolve({ status: true })
                    })
                }
            
            

        })
    },



    deleteProduct: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart), user: objectId(details.user) },
                {
                    $pull: { products: { item: objectId(details.product) } }
                }
            ).then((response) => {
                resolve({ removeCartProduct: true })
            })
        })
    },



    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) },
                },
                {
                    $unwind: "$products",
                },
                {
                    $project: {
                        item: "$products.item",
                        quantity: { $toDouble: "$products.quantity" },
                    },
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: "item",
                        foreignField: "_id",
                        as: "product",
                    },
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: {
                            $arrayElemAt: ["$product", 0],
                        },
                    },
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: 1,
                        totalPrice: { $multiply: [{ $toDouble: "$quantity" }, { $toDouble: "$product.offerPrice" }] },
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$totalPrice" },
                    },
                },
            ]).toArray();
            console.log(total);
            resolve(total[0]?.total);
        });
    },




    getSingleTotalAmount: (prodId, quantity) => {
        return new Promise(async (resolve, reject) => {
            let singleProductTotal = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(prodId) })
            singleProductTotal = singleProductTotal.price * quantity
            resolve(singleProductTotal)

        })
    },




    placeOrder: (order, products, totalPrice, userid , balance) => {
        
        return new Promise((resolve, reject) => {

            let status = order['payment-method'] === 'COD' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetails: {
                    name: order.uname,
                    phone: order.number,
                    email: order.email,
                    state: order.state,
                    homeNumber: order.houseNumber,
                    streetNumber: order.streetNumber,
                    Town: order.town,
                    zip: order.pincode
                },
                userId: objectId(userid),
                paymentMethod: order['payment-method'],
                emailId : order.email,
                walletBalance : balance.balance,
                products: products,
                total: totalPrice,
                status: status,
                date: new Date(),
                reason : false,
                returnReason : false

            }


            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(userid) })


                resolve(response.insertedId)
            })

        })
    },



    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
                .then((response) => {
                    if (response && response.products) { // check if response is not null and has products
                        console.log(response.products, "this is response");
                        resolve(response.products);
                    } else {
                        console.log("Cart not found for user with userId", userId);
                        resolve([]); // return an empty array if cart is not found
                    }
                }).catch((err) => {
                    console.log("Error occurred while retrieving cart for user with userId", userId, err);
                    reject(err);
                });
        });
    },



    getOrderDeliveryDetails: (userId, OrderId) => {
        return new Promise(async (resolve, reject) => {
            let orderdetail = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId) }).toArray()           
            resolve(orderdetail)
        })
    },


    getOrderDetails: (ordId) => {
        
        return new Promise(async (resolve, reject) => {
            let orderDetails = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(ordId) })
           
            resolve(orderDetails)
        })
    },


    getProductDetails: (ordId) => {
        
        return new Promise(async (resolve, reject) => {
            let productDetails = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(ordId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            resolve(productDetails)
        })
    },



    getUsers: (userId) => {

        return new Promise(async (resolve, reject) => {
            try {
                let userProfile = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
                resolve(userProfile)
            } catch (error) {
                reject(error)
            }
        })
    },



    addAddress: (userAddress, userId) => {

        return new Promise((resolve, reject) => {
            userAddress.userAddressId = new Date().valueOf()
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, { $push: { Address: userAddress } })
            resolve()
        })

    },


    getAllAddress: (userAddressId) => {
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.USER_COLLECTION).findOne({ userId: userAddressId });
            resolve(address);
        })
    },



    viewTotalProduct : (pageNum, limit) => {
        let skipNum = parseInt((pageNum - 1) * limit);
        
        return new Promise(async (resolve, reject) => {
          try {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().skip(skipNum).limit(limit).toArray();
            resolve(products);
          } catch (error) {
            reject(error);
          }
        });
    },
      


    getAddress: (userId) => {
        return new Promise((resolve, reject) => {
            let address = db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(userId) }
                },
                {
                    $unwind: '$Address'
                },
                {
                    $project: {
                        _id: 0,
                        Address: '$Address'
                    }
                }
            ]).toArray()
            resolve(address)
        })
    },



    getOneAddressById: (userId, address) => {

        let addressId = parseInt(address)

        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(userId)
                    }
                },
                {
                    $unwind: '$Address'
                },
                {
                    $match: { 'Address.userAddressId': addressId }
                },
                {
                    $project: {
                        Address: 1
                    }
                }
            ]).toArray()
            resolve(address[0])
        })
    },



    changeProductStatus: (data) => {
        let orderId = data.order
        let value = data.valueChange

        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, { $set: { "status": value } }).then((response) => {
                resolve(response)
            })
        })

    },



    getfullProductDetails: (userId) => {

        return new Promise(async (resolve, reject) => {
            let allProducts = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        userId: objectId(userId)
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        status: '$status'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] },
                        status: 1
                    }
                }

            ]).toArray()


            if(allProducts[0] != null){
                resolve(allProducts)
            }
            else{
                reject()
            }
        })

    },



    getfullOrderDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            let fullOrderDetails = await db.get().collection(collection.ORDER_COLLECTION).find({ user: objectId(userId) }).toArray()
            resolve(fullOrderDetails)
        })
    },



    orderCancel: (ordId) => {
        return new Promise(async(resolve, reject) => {
            let ordCancel =await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(ordId) },
                {
                    $set: {
                        status: "order cancelled"
                    }
                }
            )
            resolve(ordCancel)
        })

    },


    orderCanceled: (ordId) => {
        return new Promise((resolve, reject) => {
            let ordrCancel = db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(ordId) },
                {
                    $set: {
                        status: "order cancelled"
                    }
                }
            )
            resolve(ordrCancel)
        })
    },



    returnOrder: (ordId) => {
        return new Promise((resolve, reject) => {
            let ordReturn = db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(ordId) },
                {
                    $set: {
                        status: "product returned"
                    }
                }
            )
            resolve(ordReturn)
        })
    },



//------------------------- RAZOR PAY ----------------------------------------

    generateRazorpay: (orderId, total) => {

        return new Promise((resolve, reject) => {

            var options = {
                amount: total*100,
                currency: "INR",
                receipt: orderId.toString(),
            }

            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                    reject(err)
                }
                else {
                    resolve(order)
                }
            })
        })
    },


    verifyRazorPayment: (details) => {

        return new Promise((resolve, reject) => {

          const crypto = require('crypto')
          const hmac = crypto.createHmac('sha256', process.env.KEY_SECRET)
          hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
          const calculatedSignature = hmac.digest('hex')
         
      
          if (calculatedSignature === details['payment[razorpay_signature]']) {
            console.log("Signature is valid")
            let name='mghgh'
            resolve(name)
          } else {
            console.log("Signature is invalid")
            reject()
          }
        })
      },
      


    changePaymentStatus : (orderId) => {
       
        return new Promise((resolve , reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id : objectId(orderId)} , 
        {
            $set : {
                status : 'placed'
            }
        }
        ).then(() => {
            resolve()
        })
        })
    },


// --------------------------- end razorpay ----------------------------------------------


//-------------------------------- OTP ------------------------------------------   


    doOtp : (userData) => {
        let response = {}
        return new Promise(async(resolve , reject) => {
            let user =await db.get().collection(collection.USER_COLLECTION).findOne({phone : userData.mobile})

            if(user){
                response.status = true
                response.user = user

                client.verify.services(process.env.SERVICE_ID)
                .verifications
                .create({ to: `+91${userData.mobile}`, channel: 'sms' })
                .then((data) => {

                })
                resolve(response)
            }
            else{
                response.status = false
                resolve(response)
            }
        })
    },



    otpConfirm : (confirmotp , userData) => {
        return new Promise((resolve , reject) => {

            client.verify.services(process.env.SERVICE_ID)
            .verificationChecks
            .create({
                to: `+91${userData.phone}`,
                code: confirmotp.mobile
            }).then((data) => {
                if(data.status == 'approved'){
                    resolve({status : true})
                }
                else{
                    resolve({status : false})
                }
            })
        })
    },



//--------------------------- end otp ---------------------------------------------

//---------------------------- forgot password ------------------------------------



    getOtp: (userData) => {
        let response = {};
      
        return new Promise((resolve, reject) => {
          db.get().collection(collection.USER_COLLECTION).findOne({ phone: userData.mobile })
            .then((userNumber) => {
              if (userNumber) {
                  response.status = true;
                  response.user = userNumber;
                  
      
                client.verify.services(process.env.SERVICE_ID)
                  .verifications
                  .create({ to: `+91${userData.mobile}`, channel: 'sms' })
                  .then((data) => {
                    resolve(response);
                  })
                  .catch((error) => {
                    reject(error);
                  });
              } else {
                response.status = false;
                resolve(response);
              }
            })
            .catch((error) => {
              reject(error);
            });
        });
      },




    changePassword: (data, userData) => {

        userId = userData._id

      
        return new Promise(async(resolve, reject) => {
        data.password = await bcrypt.hash(data.password, 10)
          db.get().collection(collection.USER_COLLECTION).updateOne(
            { _id: new ObjectId(userId) },
            {
              $set: {
                password: data.password,
              },
            }
          )
            .then(() => {
              client.verify.services(process.env.SERVICE_ID)
                .verificationChecks
                .create({
                  to: `+91${userData.phone}`,
                  code: data.mobile,
                })
                .then((data) => {
                  if (data.status == "approved") {
                    resolve({ status: true });
                  } else {
                    resolve({ status: false });
                  }
                })
                .catch((error) => {
                  console.log(error);
                  reject("An error occurred while verifying SMS code");
                });
            })
            .catch((error) => {
              console.log(error);
              reject("An error occurred while updating password");
            });
        });
      },
      
      
//------------------------- end change password ---------------------------


// ------------------------- PAYPAL ----------------------------------------------


    createPay : (payment) => {
        return new Promise((resolve , reject) => {
            paypal.payment.create(payment , function (err , payment) {
                if(err){
                    reject(err)
                }
                else{
                    resolve(payment)
                }
            })
        })
    },



//------------------------------------ END ----------------------------------------


// ---------------------------- COUPENS ----------------------------------------


    getAllCoupens : () => {
        return new Promise(async(resolve , reject) =>{
            let coupen = await db.get().collection(collection.COUPEN_COLLECTION).find().toArray()
            resolve(coupen)
        })
    },


    applyCoupen : (details , userId , date , totalAmount) => {
        return new Promise(async(resolve , reject) => {
            let response = {}
            let coupen = await db.get().collection(collection.COUPEN_COLLECTION).findOne({ code : details.coupon , status : true })
            
            if(coupen) {
                const expDate = new Date(coupen.endingDate)
                response.coupenData = coupen
                let user = await db.get().collection(collection.COUPEN_COLLECTION).findOne({ code : details.coupon , users : ObjectId(userId) })

                if(user){
                    response.used = "coupen is already used"
                    resolve(response)
                }
                else{
                    if(date <= expDate){
                        response.dateValid = true
                        resolve(response)

                        let total = totalAmount

                        if(total >= coupen.minAmount){
                            response.veriftminAmount = true
                            resolve(response)

                            if(total <= coupen.maxAmount){
                                response.verifymaxAmount = true
                                resolve(response)
                            }
                            else{
                                response.veriftminAmount = true
                                response.verifymaxAmount = true
                                resolve(response)
                            }
                        }
                        else{
                            response.minAmountMsg = 'your min purchase should be : ' + coupen.minAmount
                            response.minAmount = true
                            resolve(response)
                        }
                    }
                    else{
                        response.invalidDateMsg = 'Coupen Expired'
                        response.invalidDate = true
                        response.Coupenused = false

                        resolve(response)
                    }
                }
            }
            else{
                response.invalidCoupen = true
                response.invalidCoupenMsg = 'Invalid Coupen'
                resolve(response)

            }
            if(response.dateValid && response.veriftminAmount && response.verifymaxAmount){
                response.verify = true

                db.get().collection(collection.CART_COLLECTION).updateOne({ user : ObjectId(userId) } , 
                {
                    $set : {
                        coupen : ObjectId(coupen._id)
                    }
                }
                )
                resolve(response)
            }
        })
    },


    getCart : (userId) => {
        return new Promise(async(resolve , reject) => {
           await db.get().collection(collection.CART_COLLECTION).findOne({user : objectId(userId)}).then((response) => {
                resolve(response)
            })
        })
    }



}


