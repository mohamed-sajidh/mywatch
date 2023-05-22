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
//const { Admin } = require('mongodb');
// const { route } = require('./user');
//const { blockUser } = require('../helpers/user-helpers');

// const path=require('path')
// const multer  = require('multer');
// const storage=multer.diskStorage({
//   destination: (req,file,cb) =>{
//     cb(null,'/public/product-images')
//   },
//   filename:(req,file,cb)=>{
//     console.log(file);
//     cb(null,Date.now() + path.extname(file.originalname))
//   }
// })
// const upload = multer({storage: storage })


const{getOrders,adminLogin,validation,adminValidation,adminHome,dashboard,userTable,block,unblock,productTable,addProducts,
      addProductSubmit,editProduct,editProductSubmit,removeProduct,viewOrderProduct,signOut,cancelProduct , categoryManagement , 
      addCategory , addCategorySubmit , productStatus , editCategory , editCategorySubmit , deleteCategory , viewOffer , addCoupenPost ,
      productCoupen , productOfferPost , removeCoupen , categoryCoupen , categoryOfferPost , adminForgotPassword , mobileSubmitPost , 
      NewPasswordPost , inventoryManagement , editStockPost , bannerManagement , addBanner , bannerSubmitPost , deleteBanner , 
      unlistProduct , listProduct}=require('../Controller/admin-controller');

const { addProduct, deleteProduct, viewProduct } = require('../helpers/product-helpers');
const { orderTable } = require('../Controller/user-controller');





router.get('/',adminLogin),

router.post('/adminlogin',validation,adminValidation),

router.get('/adminhome',adminHome),

router.get('/dashboard',dashboard),

router.get('/signout',signOut),

router.get('/userTable',userTable),

router.get('/blockuser/:id',block),

router.get('/unblockuser/:id',unblock),

router.get('/productTable',productTable),

router.get('/add-product',addProducts)

router.post('/addProductSubmit', upload.fields( [ { name : 'productImage1' , maxCount : 1 } , { name : 'productImage2' , maxCount : 1 } , { name : 'productImage3' , maxCount : 1 } ] ) , addProductSubmit);

router.post('/edit-product',editProduct)

router.post('/edit-product/:id',editProductSubmit)

router.get('/delete-product/:id',removeProduct)

router.get('/orderTable',getOrders)

router.get('/view-product',viewOrderProduct)

router.post('/cancel-product',cancelProduct)

router.get('/category' , categoryManagement)

router.get('/add-category' , addCategory)

router.post('/addCategory-Submit' , addCategorySubmit)

router.post('/product-status' , productStatus)

router.post('/edit-category' , editCategory)

router.post('/edit-category/:id' , editCategorySubmit)

router.get('/delete-category/:id' , deleteCategory)

router.get('/offer' , viewOffer)

router.post('/addcoupon' , addCoupenPost)

router.get('/productOffer' , productCoupen)

router.post('/addProductOffer/:id' , productOfferPost)

router.get('/delete-coupen/:id' , removeCoupen)

router.get('/categoryOffer' , categoryCoupen)

router.post('/addCategoryCoupon' , categoryOfferPost)

router.get('/admin-Forgot-Password' , adminForgotPassword)

router.post('/mobile-submit' , mobileSubmitPost)

router.post('/newPassword-submit' , NewPasswordPost)

router.get('/inventory' , inventoryManagement)

router.post('/edit-stock/:id' , editStockPost)

router.get('/banner' , bannerManagement)

router.get('/add-banner' , addBanner)

router.post('/addBannerSubmit' , upload.fields( [ { name : 'bannerImage1' , maxCount : 1 } , { name : 'bannerImage2' , maxCount : 1 } ] ), bannerSubmitPost)

router.get('/delete-banner/:id'  , deleteBanner)

router.get('/unlistProduct/:id' , unlistProduct)

router.get('/listProduct/:id' , listProduct)





module.exports = router;


