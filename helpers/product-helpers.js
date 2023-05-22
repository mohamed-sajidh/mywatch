var db = require('../config/connection')
var collection = require('../config/collection');
const { response } = require('../app');
const { ObjectId } = require('mongodb');
//const { ObjectId } = require('mongodb');
// const { response } = require('../app');
var objectId = require('mongodb').ObjectId




module.exports = {


    addProduct: (product) => {
        product.list = true
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((res) => {
                resolve({ id: res.insertedId })
            })
        })

    },


    getAllProduct: () => {
        return new Promise(async (resolve, reject) => {
            try {                
                let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
                resolve(products);
            } catch (error) {
                reject(error);
            }
        });
    },


    allBanner: () => {
        return new Promise((resolve, reject) => {
          db.connect((err) => {
            if (err) {
              reject(err);
              return;
            }
    
            db.get().collection(collection.BANNER_COLLECTION)
              .find()
              .toArray()
              .then((response) => {
                resolve(response);
              })
              .catch((error) => {
                reject(error);
              });
          });
        });
      },


    deleteProduct: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(prodId) }).then((response) => {
                resolve(response)
            })
        })
    },


    getProductDetails: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(prodId) }).then((product) => {
                resolve(product)
            })
        })
    },


    updateProduct: (prodId, proDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({ _id: objectId(prodId) }, {
                    $set: {
                        name: proDetails.name,
                        model: proDetails.model,
                        price: proDetails.price,
                        stock : +proDetails.stock,
                        description: proDetails.description
                    }
                }).then((response) => {
                    resolve(response)
                })
        })
    },


    viewProduct: (prodId) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(prodId) }).then((product) => {
                resolve(product)
            })
        })
    },


    viewProducts: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(prodId) }).then((product) => {
                resolve(product)
            })
        })
    },


    viewCartProduct: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(prodId) }).then((product) => {
                resolve(product)
            })
        })
    },


    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
          try {
            let order = await db.get().collection(collection.ORDER_COLLECTION).find().sort({ _id: -1 }).toArray();
            resolve(order);
          } catch (error) {
            reject(error);
          }
        });
      },
      


    getOrderProduct: (oneProId) => {
        return new Promise(async (resolve, reject) => {
            let orderProduct = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(oneProId) }
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
            resolve(orderProduct)
        })
    },



    getAllCategory: () => {
        return new Promise(async (resolve, reject) => {
          try {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray();
            resolve(category);
          } catch (error) {
            reject(error);
          }
        });
    },
      



    allProducts: () => {
        return new Promise(async (resolve, reject) => {
            let allProducts = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(allProducts)
        })
    },


    addProductOffer: (details, prodId, code) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let prodIdExist = await db.get().collection(collection.PRODUCT_OFFER).findOne({ prodId: prodId })
            if (prodIdExist) {
                db.get().collection(collection.PRODUCT_OFFER).updateOne({prodId : prodId},{
                    $set: {
                        discount: details.discount,
                        startDate: details.startdate,
                        endDate: details.endingdate,
                    }
                }).then((response) => {
                    resolve(response)
                })
            }
            else {
                db.get().collection(collection.PRODUCT_OFFER).insertOne(
                    {
                        prodId: prodId,
                        code: code,
                        discount: details.discount,
                        startDate: details.startdate,
                        endDate: details.endingdate,
                        status: true
                    }
                ).then((response) => {
                    resolve(response)
                })
            }

        })
    },



    addOfferPrice : (data , product) => {
        let price = product.price
        let discount = data.discount
        let prodId = product._id
        return new Promise((resolve , reject) => {
            let offerPriceInt = Math.floor(price - (price * discount) / 100)
            let offerPrice = offerPriceInt.toString()
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id : objectId(prodId)} , {$set : {offerPrice : offerPrice , discount : discount}})
        }).then((response) => {
            resolve(response)
        })
    },



    addCategoryOffer : (details) => {
        const [catId , name] = details.category.split(",");

        return new Promise(async(resolve , reject) => {
            let response = {}
            let catIdExists = await db.get().collection(collection.CATEGORY_OFFER).findOne({catId : catId})
            if(catIdExists){
                db.get().collection(collection.CATEGORY_OFFER).updateOne({ catId : catId } , 
                    {
                        $set : {
                            discount : details.discount,
                            startDate : details.startDate,
                            endDate : details.endingdate
                        }
                    }
                    ).then((response) => {
                        resolve(response)
                    })
            }
            else{
                db.get().collection(collection.CATEGORY_OFFER).insertOne(
                    {
                        catId : catId , 
                        name : name ,
                        discount : details.discount ,
                        startDate : details.startDate ,
                        endDate : details.endingdate ,
                        status : true
                    }
                ).then((response) => {
                    resolve(response)
                })
            }
        })        
    },



    getCategoryDetails: (catName) => {
        return new Promise(async(resolve , reject) => {
          let prodDetails = await db.get().collection(collection.PRODUCT_COLLECTION).find({category : catName}).toArray();
          resolve(prodDetails);
        });
    },


    addCatOfferPrice : (data , category) => {
        let price = category.price
        let discount = data.discount
        let prodId = category._id
        
        return new Promise((resolve , reject) => {
            let categoryOfferInt = Math.floor(price - (price * discount) / 100)
            let categoryOffer = categoryOfferInt.toString()
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id : ObjectId(prodId)} , {$set : {categoryOffer : categoryOffer}})
        }).then((response) => {
            resolve(response)
        })
    },


    updateStock : (prodId , quantity) => {
        return new Promise((resolve , reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id : objectId(prodId)} , {$inc : {stock : -quantity}})
            resolve()
        })
    },


    cancelStockUpdate : (prodId , quantity) => {
        return new Promise((resolve , reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id : ObjectId(prodId)} , {$inc : {stock : quantity}})
            resolve()
        })
    },


    editStock : ((prodId , details) => {
        
        return new Promise((resolve , reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id : ObjectId(prodId)} , {$set : {stock : details.stock}}).then((response) => {
                resolve()
            })           
        })
    }),



    addBanner : ((banner) => {
        return new Promise((resolve , reject) => {
            db.get().collection(collection.BANNER_COLLECTION).insertOne(banner).then((response) =>{
                resolve({ id: response.insertedId })
            })
        })
    }),



    getAllBanners : (() => {
        return new Promise(async(resolve , reject) => {
            let banner =await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            resolve(banner)
        })
    }),


    getStock : ((prodId) => {
        return new Promise(async(resolve , reject) => {
            await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id : ObjectId(prodId)}).then((response) => {
                resolve(response)
            })
            
        })
    }),


    removeBanner : ((bannerId) => {
        return new Promise((resolve , reject) => {
            db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id : ObjectId(bannerId)}).then((response) => {
                resolve()
            })
        })
    }),


    getCategory : (() => {
        return new Promise(async(resolve , reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category)
        })
    }),



    getProduct: ((category) => {
        return new Promise(async (resolve, reject) => {
          try {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: category }).toArray();
            resolve(product);
          } catch (error) {
            reject(error);
          }
        });
    }),


    getSearchProduct : ((name) => {
        return new Promise(async(resolve , reject) => {
            try {
                let product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ name : name}).toArray()
                if(product){
                    resolve(product)
                    response.status = true
                }
                else{
                    response.status = false
                }
            } catch (error) {
                reject(error)
            }
        })
    }),


    unlistProduct : ((prodId) => {
        return new Promise((resolve , reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id : ObjectId(prodId)} , {$set : {list : false }})
            resolve(response)
        })

    }),


    listProduct : ((prodId) => {
        return new Promise((resolve , reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id : ObjectId(prodId)} , {$set : {list : true   }})
            resolve(response)
        })
    })
      






    
    
    







}







