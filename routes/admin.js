var express = require('express');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/product-pictures')
    },
    filename: function (req, files, cb) {
      cb(null, Date.now() + '-' + files.originalname)
    }
  })
const upload = multer({ storage: storage });
var router = express.Router();
var userHelpers=require('../helpers/user-helpers')
var productHelpers=require('../helpers/product-helpers');
const Swal = require('sweetalert2')
const {adminSession} = require('../config/session')



const{getOrders,adminLogin,validation,adminHome,userTable,block,unblock,productTable,addProducts,
      addProductSubmit,editProduct,editProductSubmit,removeProduct,viewOrderProduct,signOut,cancelProduct , categoryManagement , 
      addCategory , addCategorySubmit , productStatus , editCategory , editCategorySubmit , deleteCategory , viewOffer , addCoupenPost ,
      productCoupen , productOfferPost , removeCoupen , categoryCoupen , categoryOfferPost , adminForgotPassword , mobileSubmitPost , 
      NewPasswordPost , inventoryManagement , editStockPost , bannerManagement , addBanner , bannerSubmitPost , deleteBanner , 
      unlistProduct , listProduct }=require('../Controller/admin-controller');

const { addProduct, deleteProduct, viewProduct } = require('../helpers/product-helpers');
const { orderTable } = require('../Controller/user-controller');




router.get('/login',adminLogin),

router.post('/adminlogin',validation),

router.get('/',adminSession,adminHome),

router.get('/signout',signOut),

router.get('/userTable',adminSession,userTable),

router.get('/blockuser/:id',adminSession,block),

router.get('/unblockuser/:id',adminSession,unblock),

router.get('/productTable',adminSession,productTable),

router.get('/add-product',adminSession,addProducts)

router.post('/addProductSubmit', upload.fields( [ { name : 'productImage1' , maxCount : 1 } , { name : 'productImage2' , maxCount : 1 } , { name : 'productImage3' , maxCount : 1 } ] ) , addProductSubmit);

router.post('/edit-product',editProduct)

router.post('/edit-product/:id',editProductSubmit)

router.get('/delete-product/:id',adminSession,removeProduct)

router.get('/orderTable',adminSession,getOrders)

router.get('/view-product',adminSession,viewOrderProduct)

router.post('/cancel-product',cancelProduct)

router.get('/category' , adminSession,categoryManagement)

router.get('/add-category' ,adminSession, addCategory)

router.post('/addCategory-Submit' , addCategorySubmit)

router.post('/product-status' , productStatus)

router.post('/edit-category' , editCategory)

router.post('/edit-category/:id' , editCategorySubmit)

router.get('/delete-category/:id' ,adminSession, deleteCategory)

router.get('/offer' ,adminSession, viewOffer)

router.post('/addcoupon' , addCoupenPost)

router.get('/productOffer' ,adminSession, productCoupen)

router.post('/addProductOffer/:id' , productOfferPost)

router.get('/delete-coupen/:id' ,adminSession, removeCoupen)

router.get('/categoryOffer' , adminSession,categoryCoupen)

router.post('/addCategoryCoupon' , categoryOfferPost)

router.get('/admin-Forgot-Password' ,adminSession, adminForgotPassword)

router.post('/mobile-submit' , mobileSubmitPost)

router.post('/newPassword-submit' , NewPasswordPost)

router.get('/inventory' ,adminSession, inventoryManagement)

router.post('/edit-stock/:id' , editStockPost)

router.get('/banner' ,adminSession, bannerManagement)

router.get('/add-banner' , adminSession,addBanner)

router.post('/addBannerSubmit' , upload.fields( [ { name : 'bannerImage1' , maxCount : 1 } , { name : 'bannerImage2' , maxCount : 1 } ] ), bannerSubmitPost)

router.get('/delete-banner/:id'  , adminSession,deleteBanner)

router.get('/unlistProduct/:id' ,adminSession, unlistProduct)

router.get('/listProduct/:id' ,adminSession, listProduct)





module.exports = router;


