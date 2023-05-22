var db = require('../config/connection')
var collection = require('../config/collection');
const { ObjectId } = require('mongodb');



module.exports={



    getStatusDetails : ((orderId) => {
        return new Promise(async(resolve, reject) => {
            let status =await db.get().collection(collection.ORDER_COLLECTION).findOne({_id : ObjectId(orderId)})
            resolve(status)
        })
    }),


    getOneOrder : ((orderId) => {
        return new Promise(async(resolve, reject) => {
            let orderDetails =await db.get().collection(collection.ORDER_COLLECTION).findOne({_id : ObjectId(orderId)})
            resolve(orderDetails)
        })
    }),



    updatePaymentMethod : ((orderId , paymentMethod) => {
        return new Promise(async(resolve, reject) => {
            const state =await db.get().collection(collection.ORDER_COLLECTION).updateOne(
            {
                _id : ObjectId(orderId)
            },
            {
                $set : {
                    paymentMethod : paymentMethod
                }
            }
            )
            resolve(state)
        })
    }),


    CHANGE_STATUS : ((orderId , status) => {
        return new Promise(async(resolve, reject) => {
            const state =await db.get().collection(collection.ORDER_COLLECTION).updateOne(
                {
                    _id : ObjectId(orderId)
                },
                {
                    $set : {
                        status : status
                    }
                }
            )
            resolve(state)
        })
    }),



    reasonUpdate : ((reason , ordId) => {
        return new Promise((resolve , reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id : ObjectId(ordId)} , {$set : {reason : reason}})
            resolve()
        })
    }),



    returnReason : ((reason , ordId) => {
        return new Promise((resolve , reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id : ObjectId(ordId)} , {$set : {returnReason : reason}})
            resolve()
        })
    })


   


}
