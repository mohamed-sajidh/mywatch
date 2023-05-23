var env = require('dotenv').config()
var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers');
var userHelpers=require('../helpers/user-helpers');
const client = require("twilio")
const Swal = require('sweetalert2')
const {userSession} = require('../config/session')


const {userHome,userLogin,signupPage,loginButton,loginHome,goToHome,signupButton,homeButton,logoutButton,productDetails,verifyLogin,cart,addToCart,changeQuantity,removeProduct,proceedToCheckout,placeOrder,orderCompletion,orderTable,viewOrders,myOrder , addToCartProductDetails , 
       userProfile , submitAddress , fillAddress , buyNow , productPagination , productDetail , cartProductDetails , myOrderss , orderCancel , placedOrderCancel , returnOrder , verifyPayment , otpLogin , mobileSubmit , otpSubmit , forgotPassword , mobileNumberSubmit , newPasswordSubmit , 
       addNewAddress , wallet  , checkCoupen , coupenVerify , filterCategory , searchProduct , sessionCheck} = require('../Controller/user-controller');
const { route } = require('./admin');


router.get('/',userHome) 

router.get('/login',userLogin)

router.post('/loginSubmit',loginButton)

router.get('/home',loginHome)

router.get('home',homeButton)

router.get('/go-to-home' , goToHome)

router.get('/signup',signupPage)

router.post('/signup',signupButton)

router.get('/logout',logoutButton)




// ------------------------ cart --------------------

router.get('/productDetails' , cartProductDetails)

router.get('/cart',verifyLogin,cart)

router.get('/add-to-cart/:id',verifyLogin,addToCart)

router.post('/changeProductQuantity',changeQuantity)

router.post('/removeCartProduct',removeProduct)

// ------------------- end ----------------------




// -------------------------- order --------------------------

router.get('/checkout',verifyLogin,proceedToCheckout)

router.post('/place-order',verifyLogin,placeOrder)

router.get('/order-completion',verifyLogin,orderCompletion)

router.get('/view-order',verifyLogin,viewOrders)

router.get('/orderTables',verifyLogin,orderTable)

router.get('/my-order',verifyLogin,myOrder)

router.get('/orderDetails' ,verifyLogin, myOrderss)

// ----------------------- end ------------------------------


// --------------------- profile -------------------

router.get('/profile' , verifyLogin,userProfile)

router.post('/verify-payment' , verifyPayment)

// -------------------- end -----------------------





// ------------------------- single product -----------------------

router.post('/product-details',productDetails)

router.get('/product-detail' , productDetail)

router.get('/addToCart-ProductDetails', verifyLogin,addToCartProductDetails)

router.get('/buyNow' , verifyLogin ,buyNow)

// ------------------------ end ---------------------





// ---------------- cancel and return order --------------------------

router.get('/cancelorder/:id' , orderCancel)

router.post('/returnorder/:id' , returnOrder)

router.post('/placedordercancel/:id' , placedOrderCancel)

// ------------------------- end ---------------------------------






// ------------------------- forgot password and otp -------------------------

router.get('/otp-login' , otpLogin)

router.post('/mobile-Submit' , mobileSubmit)

router.post('/otp-Submit' , otpSubmit)

router.get('/forgot-password' , forgotPassword)

router.post('/number-submit' , mobileNumberSubmit)

router.post('/password-submit' , newPasswordSubmit)

// ---------------------- end -------------------------------------





// --------------------------- address ---------------------------

router.post('/submit' , submitAddress)

router.post('/fillAddress' , fillAddress)

router.get('/addAddress' ,verifyLogin, addNewAddress)

// ----------------------- end ---------------------------




// --------------------- coupen and wallet -------------------

router.get('/wallet' ,verifyLogin, wallet)

router.get('/checkCoupen' , verifyLogin,checkCoupen)

router.post('/coupen-verify' , coupenVerify)

// -------------------- end ------------------------





// ---------------------- search filter and pagination --------------------------

router.post('/filter' , filterCategory)

router.post('/search' , searchProduct)

router.get('/productPagination', productPagination)

// -------------------- end -------------------------




module.exports = router;



