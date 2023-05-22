//const {getAllorders}=require('../helpers/product-helpers')
//const collection=require('../config/collection');
const userHelpers = require('../helpers/user-helpers');
const productHelpers = require('../helpers/product-helpers');
const adminHelpers = require('../helpers/admin-helpers');
const walletHelpers = require('../helpers/wallet-helpers')
const orderHelpers = require('../helpers/order-helpers')
const { response } = require('express');
const bcrypt = require('bcrypt');
//const { response, router } = require("../app");




var email = "sajidhshaji4@gmail.com";
var password = 12345;



module.exports = {

    adminLogin(req, res) {

        res.render('adminMain/adminLogin' , { layout: 'loginlayout' })
    },


    validation (req , res , next) {
        adminHelpers.adminLoginPost(req.body).then((response) => {
            console.log(response , "this is responseeeeeeeeeeeeeeeee");
            next()
        })
        .catch(() => {
            res.render('adminMain/adminLogin', { error: 'invalid username or password' })
        })
    },
    


    adminValidation(req, res) {
        res.redirect('/admin/adminhome')
    },


    async adminHome(req, res) {
        let yearly = await adminHelpers.getYearlySalesGraph()
        let daily = await adminHelpers.getDailySalesGraph()
        let weekly = await adminHelpers.getWeeklySalesGraph()
        let totalOrders = await adminHelpers.getTotalOrders()
        let totalUsers = await adminHelpers.getTotalUsers()
        let dailySales = await adminHelpers.getDailySales()
        let weeklySales = await adminHelpers.getWeeklySales()
        let yearlySales = await adminHelpers.getYearlySales()
        let productCount = await adminHelpers.getAllProductCount()
        let data = await adminHelpers.getAllData()
        let orderData = await adminHelpers.getAllOrderData()


        res.render('adminMain/adminHome', { layout: 'admin-layoutnew' , yearly , daily , weekly , totalOrders , totalUsers , dailySales , weeklySales , yearlySales , productCount , data , orderData})
    },

    dashboard(req, res) {
        res.redirect('/admin/adminhome')
    },

    signOut(req, res) {
        res.redirect('/admin')
    },


    userTable(req, res) {
        adminHelpers.getAllUsers().then((user) => {
            res.render('adminMain/userTable', { layout: 'admin-layoutnew', user })

        })
    },


    block(req, res) {
        let userId = req.params.id
        adminHelpers.blockUser(userId).then(() => {
            res.redirect('/admin/userTable')
        })
    },


    unblock(req, res) {
        let userId = req.params.id
        adminHelpers.unblockUser(userId).then(() => {
            res.redirect('/admin/userTable')
        })
    },


    productTable(req, res) {
        productHelpers.getAllProduct().then((product) => {
            res.render('adminMain/productTable', { layout: 'admin-layoutnew', product })

        })
    },


    addProducts(req, res) {
        productHelpers.getAllCategory().then((category) => {
            res.render('adminMain/addProduct', { layout: 'admin-layoutnew', category })
        })
    },


    addProductSubmit(req, res) {

        req.body.img1 = req.files.productImage1[0].filename
        req.body.img2 = req.files.productImage2[0].filename
        req.body.img3 = req.files.productImage3[0].filename
       
        let stockString = req.body.stock
        let stock = parseInt(stockString);
        req.body.stock = stock
        productHelpers.addProduct(req.body).then((id) => {
            res.redirect('/admin/productTable')
        })
    },



    async editProduct(req, res) {
        let product = await productHelpers.getProductDetails(req.body.id)
        res.render('adminMain/editProduct', { layout: 'admin-layoutnew', product })
    },


    editProductSubmit(req, res) {
        productHelpers.updateProduct(req.params.id, req.body).then((response) => {
            res.redirect('/admin/productTable')
        })
    },



    removeProduct(req, res) {
        let prodId = req.params.id
        productHelpers.deleteProduct(prodId).then((response) => {
            res.redirect('/admin/productTable')
        })

    },
   

    getOrders(req, res) {
        productHelpers.getAllOrders().then((order) => {
            res.render('adminMain/allOrders', { layout: 'admin-layoutnew', order })
        })

    },


    viewOrderProduct(req, res) {
        const oneProductId = req.query.id
        productHelpers.getOrderProduct(oneProductId).then((oneOrderProduct) => {
            res.render('adminMain/viewProduct', { layout: 'admin-layoutnew', oneOrderProduct })
        })
    },




    cancelProduct(req, res) {
        adminHelpers.cancelOrder(req.body.id).then(() => {
            res.redirect('/admin/allOrders')
        })
    },


    categoryManagement(req, res) {
        adminHelpers.getAllCategory().then((category) => {
            res.render('adminMain/categoryManagement', { layout: 'admin-layoutnew', category })
        })

    },



    addCategory(req, res) {
        res.render('adminMain/addCategory' , { layout: 'admin-layoutnew' })
    },


    addCategorySubmit(req, res) {
        adminHelpers.addCategory(req.body).then((id) => {
            res.redirect('/admin/add-category')
        })
    },


    productStatus(req, res) {
        let data = req.body

        userHelpers.changeProductStatus(data).then((response) => {

            res.json(response)
        })
    }, 


    async editCategory (req , res) {
        let category =await adminHelpers.getCategoryDetails(req.body.id)
        res.render('adminMain/editCategory' , {layout : 'admin-layoutnew' , category})
    },


    editCategorySubmit (req , res) {
        adminHelpers.editCategory(req.params.id , req.body).then((response) => {
            res.redirect('/admin/category')
        })
    },


    deleteCategory (req , res) {
        categoryId = req.params.id
        adminHelpers.removeCategory(categoryId).then((response) => {
            res.redirect('/admin/category')
        })
    },


    viewOffer (req , res) {
        adminHelpers.viewCoupens().then((coupen) => {
            res.render('adminMain/view-offer' , {layout : 'admin-layoutnew' , coupen , oferEror:req.session.Eror})
            req.session.Eror = null
        })
    },


    addCoupenPost (req , res) {
        const couponCode = Math.random().toString(36).substring(2, 10);
        adminHelpers.addCoupen(req.body , couponCode).then((response) => {
            if(response.message){
                req.session.Eror = response.message
            }
            res.redirect('/admin/offer')
        })
    },


    productCoupen (req , res) {
        productHelpers.allProducts().then((product) => {       
            res.render('adminMain/product-coupen' , { layout : 'admin-layoutnew' , product})
        })
    },



    productOfferPost (req , res) {
       let prodId = req.params.id
       const productCode = Math.random().toString(36).substring(2, 10);
        productHelpers.addProductOffer(req.body , prodId , productCode).then(async(response) => {
            let singleProduct = await productHelpers.getProductDetails(prodId)
            productHelpers.addOfferPrice(req.body , singleProduct).then((response) => {
            })
            res.redirect('/admin/productOffer')
        })
    },



    removeCoupen (req , res){
        let coupenId = req.params.id
        adminHelpers.deleteCoupen(coupenId).then((response) => {
            res.redirect('/admin/offer')
        })
    },



    async categoryCoupen (req , res){
        let category = await adminHelpers.allCategory()
        adminHelpers.getAllOffers().then((offer) => {
            res.render('adminMain/category-coupen' , { layout : 'admin-layoutnew' , category , offer})
        })
    },



    categoryOfferPost (req , res){
        const [catId , name] = req.body.category.split(",");
        productHelpers.addCategoryOffer(req.body).then(async(response) =>{
            const singleCategory = await productHelpers.getCategoryDetails(name);   
            productHelpers.addCatOfferPrice(req.body , singleCategory).then((response) => {
            })        
            res.redirect('/admin/categoryOffer')          
        })
    }, 


    adminForgotPassword (req , res) {       
        res.render('adminMain/adminForgotPassword' , { layout: 'loginlayout' })
    },



    mobileSubmitPost (req , res) {
        adminHelpers.getAdminOtp(req.body).then((response) => {
            if(response.status){
                signupData = response.admin
                res.render('adminMain/adminNewPassword' , { layout: 'loginlayout' })
            }
            else{
                res.render('adminMain/adminForgotPassword' , { layout: 'loginlayout' , error: 'invalid mobile number'})
            }
        })
    },



    NewPasswordPost : (req , res) => {
        
        adminHelpers.changeAdminPassword(req.body , signupData).then((response) => {
            if(response.status) {
                res.redirect('/admin')
            }else{
                res.render('adminMain/adminNewPassword' , { layout: 'loginlayout' , error: 'Password not changed'})
            }
        })
        .catch(error => {
            res.render('adminMain/adminNewPassword' , { layout: 'loginlayout' , error: 'An error occurred while changing password'})
        });
    },


    inventoryManagement : (req , res) => {
        productHelpers.getAllProduct().then((product) => {

            res.render('adminMain/inventoryManagement' , { layout : 'admin-layoutnew' , product})
        })
    },


    editStockPost : (async(req , res) => {
        let prodId = req.params.id
        let product = await productHelpers.getProductDetails(prodId)
        let stock = parseInt(req.body.stock)
        req.body.stock = stock
        productHelpers.editStock(prodId , req.body).then(() => {
            res.redirect('/admin/inventory')
        })       
    }),


    bannerManagement : ((req , res) => {
        productHelpers.getAllBanners().then((banner) => {
            res.render('adminMain/bannerManagement' , { layout : 'admin-layoutnew' , banner})
        })
    }),


    addBanner : ((req , res) => {
        res.render('adminMain/addBanner' , { layout : 'admin-layoutnew'})
    }),



    bannerSubmitPost : ((req , res) => { 
        
        req.body.img1 = req.files.bannerImage1[0].filename
        req.body.img2 = req.files.bannerImage2[0].filename

        productHelpers.addBanner(req.body).then((response) => {
            res.redirect('/admin/banner')
        })
    }),


    deleteBanner : ((req , res) => {
        let bannerId = req.params.id
        productHelpers.removeBanner(bannerId).then((response) => {
            res.redirect('/admin/banner')
        })
    }),


    unlistProduct : ((req , res) => {
        let prodId = req.params.id
        productHelpers.unlistProduct(prodId).then((response) => {
            res.redirect('/admin/productTable')
        })
    }),


    listProduct : ((req , res) => {
        let prodId = req.params.id
        productHelpers.listProduct(prodId).then((response) => {
            res.redirect('/admin/productTable')
        })
    })
        
    


    


    

    

















    
}