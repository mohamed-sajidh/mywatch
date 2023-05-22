require('dotenv').config()
const collection = require("../config/collection");
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require("../helpers/user-helpers");
const adminHelpers = require("../helpers/admin-helpers");
const walletHelpers = require("../helpers/wallet-helpers")
const orderHelpers = require("../helpers/order-helpers")
var objectId = require('mongodb').ObjectId
const flash = require('connect-flash');


const client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);


const { Db, ObjectId } = require("mongodb");
var mongoose = require('mongoose');
const { log } = require("handlebars");
const { response } = require('../app');

var paypal = require('paypal-rest-sdk');



const Total = async (req) => {
    let user = req.session.user


    return await userHelpers.getTotalAmount(user._id).then((total) => {
        return total
    })
}


module.exports = {


    async userHome(req, res) {

        let user = req.session.user
        let cartCount = null;
        if (req.session.user) {
            cartCount = await userHelpers.getCartCount(req.session.user._id)
        }
        let banner = await productHelpers.allBanner()
        productHelpers.getAllProduct().then(async (products) => {
            let totalProducts = products.length
            let limit = 4
            let product = products.slice(0, limit)
            let pages = []

            for (let i = 1; i <= Math.ceil(totalProducts / limit); i++) {
                pages.push(i)
            }

            let productCategory = await productHelpers.getCategory()


            res.render('user/userHome', { product, user, cartCount, pages, banner, productCategory })
        })
    },

    userLogin(req, res) {
        if (req.session.loggedIn) {
            res.redirect('/')
        } else {
            res.render('user/userLogin')
        }
    },


    sessionCheck: async (req, res, next) => {
        if (req.session.user) {
          try {
            const user = await userHelpers.getUsers(req.session.user._id);
            if (user.isBlocked) {
              req.session.loggedIn = false;
              req.session.user = null;
              res.redirect('/login');
            } else {
              next();
            }
          } catch (error) {
            console.error(error);
            res.redirect('/login');
          }
        } else { 
          res.redirect('/login');
        }
    },
      

    loginButton(req, res) {

        userHelpers.doLogin(req.body).then((response) => {
            if (response.status) {
                if (response.user.isBlocked) {
                    res.render('user/userLogin', { error: 'you are blocked' })
                } else {
                    req.session.loggedIn = true
                    req.session.user = response.user
                    res.redirect('/')
                }
            } else {
                res.render('user/userLogin', { error: 'you are blocked' })
            }
        }).catch(() => {
            res.render('user/userLogin', { error: 'invalid username or password' })
        })
    },


    loginHome(req, res) {
        productHelpers.getAllProduct().then((product) => {
            res.render('user/userHome', { product, user: req.session.user })
        })
    },


    goToHome(req, res) {
        res.redirect('/')
    },


    homeButton(req, res) {
        res.render('user/userHome', { product, cartCount })
    },

    signupPage(req, res) {
        res.render('user/userSignup', { errMessage: req.flash('userExists') });
    },

    //   -------------------

    async signupButton(req, res) {
        let data = req.body
        await walletHelpers.CREATE_WALLET(data)
        userHelpers.doSignup(data).then((response) => {
            req.session.loggedIn = true;
            req.session.user = response
            res.render('user/userLogin')
        })
        .catch((response) => {
            if(response.emailExists){
                req.flash('userExists', 'This Email is  already registered with us! !')
                res.redirect('/signup')
            }
            if (response.mobileExists) {
                req.flash('userExists', 'This Mobile number is already registered with us!')
                res.redirect('/signup')
            }
        })

    },


    logoutButton(req, res) {
        req.session.destroy()
        res.redirect('/')
    },


    async productDetails(req, res) {
        let user = req.session.user
        if (user) {
            cartCount = await userHelpers.getCartCount(user._id)
        }
        productHelpers.viewProduct(req.body.id).then((product) => {
            console.log(product);
            res.render('user/productDetails', { product, user, cartCount })
        })
    },


    async productDetail(req, res) {
        let user = req.session.user
        if (user) {
            cartCount = await userHelpers.getCartCount(user._id)
        }
        productHelpers.viewProducts(req.query.id).then((product) => {
            res.render('user/productDetails', { product, user })
        })
    },


    async cartProductDetails(req, res) {
        let user = req.session.user
        if (user) {
            cartCount = await userHelpers.getCartCount(user._id)
        }
        productHelpers.viewCartProduct(req.query.id).then((product) => {
            res.render('user/productDetails', { product, user, cartCount })
        })
    },


    verifyLogin(req, res, next) {
        if (req.session.loggedIn) {
            console.log("log aanu");
            next()
        } else {
            console.log("logalla")
            res.redirect('/login')
        }
    },


    async cart(req, res) {

        let user = req.session.user
        let products = await userHelpers.getCartProducts(req.session.user._id)

        if (products.length !== 0) {
            console.log('hitted');
            if (req.session.stockFull) {
                userHelpers.getTotalAmount(req.session.user._id).then((total) => {
                    res.render('user/userCart', { products, user, total, page: 'Shopping Cart' , stockFull : true})
                })
                req.session.stockFull = false
            }else{
                userHelpers.getTotalAmount(req.session.user._id).then((total) => {
                    res.render('user/userCart', { products, user, total, page: 'Shopping Cart' })
                })
            }
            
        } else {

            res.render('user/userCart', { user, page: 'Cart is empty' })
        }
    },


    async addToCart(req, res) {
        let cartExist = await userHelpers.getCart(req.session.user._id)
        let productDetail = await productHelpers.viewProducts(req.params.id)
        let stock = productDetail.stock
        let quantity = 0
        if (cartExist) for (let i = 0; i < cartExist.products.length; i++) {
            const cartProId = cartExist.products[i].item.toString()
            if (req.params.id == cartProId) {
                quantity = cartExist.products[i].quantity
                break;
            }
        }
        if (quantity + 1 > stock) {

            res.json({ stock: true })

        } else {
            userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
                res.json({ status: true })
            })
        }
    },

    

    async changeQuantity(req, res, next) {
        let prodId = req.body.product
        let getStock = await productHelpers.getStock(prodId)
        let stock = getStock.stock
        const updatedCount = parseInt(req.body.quantity) + parseInt(req.body.count)

        if (updatedCount <= stock) {

            let singleProduct = await productHelpers.getProductDetails(prodId)

            userHelpers.changeProductQuantity(req.body, singleProduct).then(async (response) => {

                response.total = await userHelpers.getTotalAmount(req.body.user)

                response.productId = req.body.product

                res.json(response)

            })

        }

        else {

            res.json({ stock: true })

        }


    },


    removeProduct(req, res) {
        userHelpers.deleteProduct(req.body).then((response) => {
            res.json(response)
        })
    },


    async proceedToCheckout(req, res) {
        try {
          let products = await userHelpers.getCartProducts(req.session.user._id);
          let address = await userHelpers.getAddress(req.session.user._id);
      
          let flag = false;
          for (let i = 0; i < products.length; i++) {
            if (products[i].product && products[i].quantity > products[i].product.stock) {
              flag = true;
              break;
            }
          }
      
          if (flag) {
            req.session.stockFull = true;
            res.redirect('/cart');
          } else {
            let total = await userHelpers.getTotalAmount(req.session.user._id);
            res.render('user/userCheckout', { user: req.session.user, total, products, address });
          }
        } catch (error) {
          res.render('user/userCheckout', { user: req.session.user });
        }
      },



    placeOrder: (async (req, res) => {

        if(!req.body['payment-method']){

            res.json({payErr:true})
            
        }else{       

        let address = await userHelpers.getAllAddress(req.session.user._id)

        let products = await userHelpers.getCartProductList(req.session.user._id)

        if (req.session.amount) {
            var totalPrice = req.session.amount
        }
        else if (!req.session.amount) {
            var totalPrice = await userHelpers.getTotalAmount(req.session.user._id)
        }

        let balance = await walletHelpers.WALLET_BALANCE(req.session.user.email)

        userHelpers.placeOrder(req.body, products, totalPrice, req.session.user._id, balance).then(async (ordId) => {

            for (let i = 0; i < products.length; i++) {
                await productHelpers.updateStock(products[i].item, products[i].quantity)
            }

            req.session.orderId = ordId;

            if (req.body['payment-method'] == "COD") {

                res.json({ codSuccess: true })
            }
            else if (req.body['payment-method'] == "RAZORPAY") {

                userHelpers.generateRazorpay(ordId, totalPrice).then((response) => {

                    res.json(response)
                })
            }

            else if (req.body['payment-method'] == "PAYPAL") {
                var payment = {
                    "intent": "sale",
                    "payer": {
                        "payment_method": "paypal"
                    },
                    "redirect_urls": {
                        "return_url": "http://localhost:3000/order-completion",
                        "cancel_url": "http://localhost:3000"
                    },
                    "transactions": [{
                        "amount": {
                            "currency": "USD",
                            "total": totalPrice
                        },
                        "description": ordId
                    }]
                };

                userHelpers.createPay(payment).then((transaction) => {

                    var id = transaction.id
                    var links = transaction.links
                    var counter = links.length

                    while (counter--) {
                        if (links[counter].rel == 'approval_url') {
                            transaction.pay = true
                            transaction.linkto = links[counter].href
                            transaction.orderId = ordId
                            userHelpers.changePaymentStatus(ordId).then(() => {
                                res.json(transaction)
                            })
                        }
                    }
                })

            }
            else if (req.body['payment-method'] == "WALLET") {
                walletHelpers.WALLET_BALANCE(req.session.user.email).then((result) => {
                    if (result.balance < totalPrice) {
                        res.json({ walletSuccess: false })
                    } else {
                        orderHelpers.updatePaymentMethod(req.session.orderId, req.body['payment-method'])
                        orderHelpers.CHANGE_STATUS(req.session.orderId, (state = "placed"))
                        walletHelpers.UPDATE_WALLET(req.session.user.email, -totalPrice)
                        res.json({ walletSuccess: true })
                    }
                })

            }


        })
    }
    }),



    async orderCompletion(req, res) {
        ordId = req.session.orderId

        let orderDetails = await userHelpers.getOrderDetails(ordId)
        let productDetails = await userHelpers.getProductDetails(ordId)

        res.render('user/orderConfirm', { user: req.session.user, orderDetails, productDetails })
    },


    viewOrders(req, res) {
        getOrderDeliveryDetails(req.session.user._id, req.params.id).then((order) => {
            res.render('user/orderCompletion', { order, user: req.session.user })
            res.render('user/orderCompletion')
        })
    },



    orderTable(req, res) {
        res.render('user/orderTables')
    },


    myOrder(req, res) {
        getOrderDeliveryDetails(req.session.user._id, req.body._id).then((order) => {

            res.render('user/orderCompletion', { order, user: req.session.user })
            res.render('user/orderCompletion')
        })
    },



    addToCartProductDetails(req, res) {
        res.redirect('/product-details')

    },


    async userProfile(req, res) {
        let user = req.session.user
        let userId = req.session.user._id
        const userProfile = await userHelpers.getUsers(userId)
        const coupen = await userHelpers.getAllCoupens()
        res.render('user/userProfile', { userProfile, userId, user, coupen })
    },


    submitAddress(req, res) {
        let user = req.session.user
        userHelpers.addAddress(req.body, user._id).then(() => {
            res.redirect('/profile')
        })
    },


    async fillAddress(req, res) {
        let userAddressId = req.body.addressId

        if (userAddressId != "select") {
            let getOneAddress = await userHelpers.getOneAddressById(req.session.user._id, userAddressId)

            let response = getOneAddress.Address
            response.status = true
            res.json(response)
        }
        else {
            res.json({ status: false })
        }
    },


    buyNow(req, res) {
        res.redirect('/checkout')
    },

    

    productPagination: async (req, res) => {
        try {
          let user = req.session.user;
          let pageCount = req.query.id || 1;
          let pageNum = parseInt(pageCount);
          let limit = 4;

          let cartCount = null;
          if (req.session.user) {
                cartCount = await userHelpers.getCartCount(user._id)
            }
      
          let product = await userHelpers.viewTotalProduct(pageNum, limit);
          let products = await productHelpers.getAllProduct();
          let banner = await productHelpers.allBanner()
          let productCategory = await productHelpers.getCategory()
          let totalProducts = products.length;
          let pages = [];
      
      
          for (let i = 1; i <= Math.ceil(totalProducts / limit); i++) {
            pages.push(i);
          }
      
          res.render('user/userHome', { user, product, pages , banner , productCategory , cartCount});
        } catch (error) {
          // Handle error appropriately
        }
      },
      

    myOrderss: (async (req, res) => {
        let user = req.session.user
        await userHelpers.getfullProductDetails(req.session.user._id).then((fullProductDetails) => {
            res.render('user/orderDetails', { fullProductDetails, user })
        }).catch(() => {
            res.render('user/error')
        })

    }),



    orderCancel: ((req, res) => {
        let ordId = req.params.id
        let ordrCancel = userHelpers.orderCanceled(ordId)
    }),



    placedOrderCancel: (async (req, res) => {
        let ordId = req.params.id
        let reason = await orderHelpers.reasonUpdate(req.body.reason, ordId)
        let ordCancel = await userHelpers.orderCancel(ordId)
        let singleOrder = await orderHelpers.getStatusDetails(ordId)
        let orderProduct = await userHelpers.getProductDetails(ordId)
        let status = singleOrder.status

        if (status === 'order cancelled') {
            for (let i = 0; i < orderProduct.length; i++) {
                await productHelpers.cancelStockUpdate(orderProduct[i].item, orderProduct[i].quantity)
            }
            let orderDetails = await orderHelpers.getOneOrder(ordId)
            let totalAmount = orderDetails.total
            if (orderDetails.status !== 'pending') {
                if (orderDetails.paymentMethod !== 'COD') {

                    walletHelpers.UPDATE_WALLET(singleOrder.emailId, totalAmount)

                }
            }
        }
        res.json({ status: true })
    }),


    returnOrder: (async (req, res) => {
        let ordId = req.params.id
        let orderReturm = userHelpers.returnOrder(ordId)
        let returnReason = await orderHelpers.returnReason(req.body.returnReason, ordId)
        let oneOrder = await orderHelpers.getStatusDetails(ordId)
        let orderProducts = await userHelpers.getProductDetails(ordId)
        let status = oneOrder.status

        if (status === 'product returned') {
            for (let i = 0; i < orderProducts.length; i++) {
                await productHelpers.cancelStockUpdate(orderProducts[i].item, orderProducts[i].quantity)
            }
            let oneOrderDetails = await orderHelpers.getOneOrder(ordId)
            let totalAmount = oneOrderDetails.total
            if (oneOrderDetails.status !== 'pending') {
                if (oneOrderDetails.paymentMethod !== 'COD') {
                    walletHelpers.UPDATE_WALLET(oneOrder.emailId, totalAmount)
                }
            }
        }
        res.json({ status: true })
    }),



    verifyPayment: ((req, res) => {
        userHelpers.verifyRazorPayment(req.body).then((status) => {
            console.log(status, "status");
            userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
                console.log("payment successfull");
                res.json({ status: true })
            })
        }).catch((err) => {
            console.log(err, "this is error");
            res.json({ status: 'payment failed' })
        })
    }),



    otpLogin: ((req, res) => {
        res.render('user/otpLogin')
    }),


    mobileSubmit: ((req, res) => {
        userHelpers.doOtp(req.body).then((response) => {
            if (response.status) {
                signupData = response.user
                res.render('user/otpSubmit')
            }
            else {
                res.render('user/otpLogin', { error: 'invalid mobile number' })

            }
        })
    }),


    otpSubmit: ((req, res) => {

        userHelpers.otpConfirm(req.body, signupData).then((response) => {
            if (response.status) {
                req.session.loggedIn = true
                req.session.user = signupData;


                res.redirect('/')
            }
            else {
                res.render('user/otpSubmit', { error: 'incorrect otp' })
            }
        })

    }),


    forgotPassword: ((req, res) => {
        res.render('user/forgotPassword')
    }),


    mobileNumberSubmit: ((req, res) => {
        userHelpers.getOtp(req.body).then((response) => {
            if (response.status) {
                signupData = response.user
                res.render('user/newPassword')
            }
            else {
                res.render('user/forgotPassword', { error: 'invalid mobile number' })
            }

        })
    }),


    newPasswordSubmit: (req, res) => {

        userHelpers.changePassword(req.body, signupData).then((response) => {
            if (response.status) {
                req.session.loggedIn = true;
                req.session.user = signupData;
                res.redirect('/login');
            } else {
                res.render('user/newPassword', { error: 'Password not changed' });
            }
        })
            .catch(error => {
                res.render('user/newPassword', { error: 'An error occurred while changing password' });
            });
    },


    addNewAddress: (req, res) => {
        res.redirect('/profile')
    },


    wallet: async (req, res) => {
        try {
            const user = req.session.user;
            const userId = req.session.user._id;
            const orderDetails = await walletHelpers.GET_ORDER_WALLET(user.email, 'WALLET');
            if (!orderDetails) {
                throw new Error('No order details found');
            }
            const order = JSON.parse(JSON.stringify(orderDetails));
            const data = await walletHelpers.GET_WALLET(user.email);
            let walletData = await walletHelpers.WALLET_BALANCE(user.email)
            res.render('user/wallet', { userId, user, order, data, walletData });
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },



    checkCoupen: ((req, res) => {
        res.redirect('/profile')
    }),


    coupenVerify: (async (req, res) => {
        let user = req.session.user._id
        const date = new Date()
        let totalAmount = await userHelpers.getTotalAmount(user)
        let total = totalAmount


        if (req.body.coupen == '') {
            res.json({
                noCoupen: true,
                total
            })
        }
        else {
            let coupenResponse = await userHelpers.applyCoupen(req.body, user, date, totalAmount)
            if (coupenResponse.verify) {
                coupenResponse.originalPrice = totalAmount
                let discountAmount = (totalAmount * parseInt(coupenResponse.coupenData.value)) / 100

                if (discountAmount > parseInt(coupenResponse.coupenData.maxAmount)) {
                    discountAmount = parseInt(coupenResponse.coupenData.maxAmount)
                }
                let amount = totalAmount - discountAmount
                coupenResponse.discountAmount = Math.round(discountAmount)
                coupenResponse.amount = Math.round(amount)
                req.session.amount = Math.round(amount)
                coupenResponse.savedAmount = totalAmount - Math.round(amount)
                res.json(coupenResponse)
            }
            else {
                coupenResponse.total = totalAmount
                res.json(coupenResponse)
            }
        }
    }),


    filterCategory : (async (req , res) => {
        let category = req.body.category
        let user = req.session.user
        let cartCount = null;
        if (req.session.user) {
            cartCount = await userHelpers.getCartCount(req.session.user._id)
        }

        let product =await productHelpers.getProduct(category)
        let productCategory = await productHelpers.getCategory()
        let banner = await productHelpers.allBanner()

        res.render('user/userHome', { product , productCategory , banner , user , cartCount})
    }),



    searchProduct : (async (req , res) => {
        let name = req.body.name
        let user = req.session.user
        let cartCount = null;
        if (req.session.user) {
            cartCount = await userHelpers.getCartCount(req.session.user._id)
        }

        let product = await productHelpers.getSearchProduct(name)
        let productCategory = await productHelpers.getCategory()
        let banner = await productHelpers.allBanner()

        if(product){
            res.render('user/userHome', { product , productCategory , banner , user , cartCount})
        }
        else{
            res.render('user/userHome', {   productCategory , banner , user , cartCount , error: 'no product found'})

        }

    
    })






}


