var db = require('../config/connection')
var collection = require('../config/collection')
var objectId = require('mongodb').ObjectId
const { ObjectId } = require('mongodb');
const { Collection } = require('mongoose');
const { response } = require('../app');
const bcrypt = require('bcrypt');
const { log } = require('handlebars');
require('dotenv').config()
const client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);



module.exports = {

    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).find().sort({ _id: -1 }).toArray()
            resolve(user)
        })
    },


    blockUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                $set: {
                    isBlocked: true
                }
            }).then((response) => {
                resolve()
            })
        })
    },


    unblockUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                $set: {
                    isBlocked: false
                }
            }).then((response) => {
                resolve()
            })
        })
    },



    cancelOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                $set: {
                    status: "order cancel"
                }
            }).then((response) => {
                resolve()
            })
        })
    },



    getAllCategory: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category)
        })
    },



    addCategory: (category) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((res) => {
                resolve({ id: res.insertedId })
            })
        })
    },



    getYearlySalesGraph: () => {
        return new Promise(async (resolve, reject) => {
            try {
                // Assuming you have properly initialized and connected the 'db' object
                const collection = db.get().collection('ORDER_COLLECTION');

                const sales = await collection.aggregate([
                    {
                        $project: {
                            date: 1,
                            total: 1
                        }
                    },
                    {
                        $group: {
                            _id: { $dateToString: { format: '%Y', date: '$date' } },
                            total: { $sum: '$total' },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $sort: {
                            _id: 1
                        }
                    },
                    {
                        $limit: 7
                    }
                ]).toArray();

                resolve(sales);
            } catch (error) {
                reject(error);
            }
        });
    },


    getDailySalesGraph: () => {
        return new Promise(async (resolve, reject) => {
            let dailysales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: {
                        date: 1,
                        total: 1
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%d-%m-%Y", date: "$date" } },
                        total: { $sum: "$total" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                },
                {
                    $limit: 7
                }
            ]).toArray()

            resolve(dailysales)
        })
    },



    getWeeklySalesGraph: () => {
        return new Promise(async (resolve, reject) => {
            let dailysales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: {
                        date: 1,
                        total: 1
                    }
                },
                {
                    $group: {
                        _id: { $week: "$date" },
                        total: { $sum: "$total" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                },
                {
                    $limit: 7
                }
            ]).toArray()
            resolve(dailysales)
        })
    },



    getTotalOrders: () => {
        return new Promise(async (resolve, reject) => {
            let totalCount = await db.get().collection(collection.ORDER_COLLECTION).find().count()
            resolve(totalCount)
        })
    },


    getTotalUsers: () => {
        return new Promise(async (resolve, reject) => {
            let totalUsers = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: {
                        "isBlocked": false
                    }
                },
                {
                    $project: {
                        user: {
                            _id: 1
                        }
                    }
                },
                {
                    $count: 'user'
                }
            ]).toArray();

            if (totalUsers.length > 0) {
                resolve(totalUsers[0].user);
            } else {
                resolve(0);
            }
        });
    }
    ,


    getDailySales: () => {
        return new Promise(async (resolve, reject) => {
            let salesData = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: {
                        date: 1,
                        total: 1
                    }
                },
                {
                    $group: {
                        _id: { day: { $dayOfYear: { $toDate: "$date" } } },
                        total: { $sum: '$total' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: -1 }
                },
                {
                    $limit: 5
                }
            ]).toArray()
            resolve(salesData[0].total)
        })
    },


    getWeeklySales: () => {
        return new Promise(async (resolve, reject) => {
            let weeklySales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: {
                        date: 1,
                        total: 1
                    }
                },
                {
                    $group: {
                        _id: { week: { $week: { $toDate: "$date" } } },
                        total: { $sum: "$total" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: -1 }
                },
                {
                    $limit: 5
                }
            ]).toArray()
            resolve(weeklySales[0].total)
        })
    },


    getYearlySales: () => {
        return new Promise(async (resolve, reject) => {
            let yearlySales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: {
                        date: 1,
                        total: 1
                    }
                },
                {
                    $match: {
                        date: {
                            $gte: new Date(new Date().getFullYear(), 0, 1),
                            $lte: new Date(new Date().getFullYear(), 11, 31)
                        }
                    }
                },
                {
                    $group: {
                        _id: { year: { $year: { $toDate: "$date" } } },
                        total: { $sum: "$total" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: -1 }
                },
                {
                    $limit: 1
                }
            ]).toArray()
            resolve(yearlySales[0].total)
        })
    },



    getAllProductCount: () => {
        return new Promise(async (resolve, reject) => {
            let productCount = await db.get().collection(collection.PRODUCT_COLLECTION).find().count()
            resolve(productCount)
        })
    },


    getAllData: () => {
        return new Promise(async (resolve, reject) => {
            let data = {}

            data.COD = await db.get().collection(collection.ORDER_COLLECTION).find({ paymentMethod: "COD" }).count()
            data.PAYPAL = await db.get().collection(collection.ORDER_COLLECTION).find({ paymentMethod: "PAYPAL" }).count()
            data.RAZORPAY = await db.get().collection(collection.ORDER_COLLECTION).find({ paymentMethod: "RAZORPAY" }).count()
            data.WALLET = await db.get().collection(collection.ORDER_COLLECTION).find({ paymentMethod: "WALLET" }).count()
            resolve(data)
        })
    },


    getAllOrderData: () => {
        return new Promise(async (resolve, reject) => {
            let orderData = {}

            orderData.PLACED = await db.get().collection(collection.ORDER_COLLECTION).find({ status: "placed" }).count()
            orderData.DELIVERED = await db.get().collection(collection.ORDER_COLLECTION).find({ status: "Delivered" }).count()
            orderData.CANCEL = await db.get().collection(collection.ORDER_COLLECTION).find({ status: "order cancelled" }).count()
            orderData.PENDING = await db.get().collection(collection.ORDER_COLLECTION).find({ status: "pending" }).count()
            orderData.RETURNED = await db.get().collection(collection.ORDER_COLLECTION).find({ status: "product returned" }).count()
            orderData.ORDERCANCEL = await db.get().collection(collection.ORDER_COLLECTION).find({ status: "order cancelled" }).count()

            resolve(orderData)
        })
    },


    getCategoryDetails: (categoryId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: ObjectId(categoryId) }).then((category) => {
                resolve(category)
            })
        })
    },


    editCategory: (categoryId, categoryDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: ObjectId(categoryId) },
                {
                    $set: {
                        name: categoryDetails.name,
                        description: categoryDetails.description
                    }
                }
            ).then((response) => {
                resolve(response)
            })
        })
    },



    removeCategory: (categoryId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: ObjectId(categoryId) }).then((response) => {
                resolve(response)
            })
        })
    },


    addCoupen: (coupenDetails, code) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let coupenExist = await db.get().collection(collection.COUPEN_COLLECTION).findOne({ code: coupenDetails.code })

            if (coupenExist) {
                response.status = true
                response.message = "Coupen with this code is already exists"
                resolve(response)
            }
            else {
                db.get().collection(collection.COUPEN_COLLECTION).insertOne(
                    {
                        name: coupenDetails.name,
                        code: code,
                        startDate: coupenDetails.startdate,
                        endingDate: coupenDetails.endingdate,
                        value: coupenDetails.discount,
                        minAmount: coupenDetails.minAmount,
                        maxAmount: coupenDetails.maxAmount,
                        status: true
                    }
                ).then((response) => {
                    response.status = false
                    response.message = "Coupen added successfully"
                    resolve(response)
                })
            }

        })
    },


    viewCoupens: () => {
        return new Promise((resolve, reject) => {
            let coupen = db.get().collection(collection.COUPEN_COLLECTION).find().toArray()
            resolve(coupen)
        })
    },


    deleteCoupen: (coupenId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPEN_COLLECTION).deleteOne({ _id: ObjectId(coupenId) }).then((response) => {
                resolve(response)
            })
        })
    },


    allCategory: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category)
        })
    },


    getAllOffers: () => {
        return new Promise(async (resolve, reject) => {
            let offer = await db.get().collection(collection.CATEGORY_OFFER).find().toArray()
            resolve(offer)
        })
    },


    adminLoginPost: (data) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: data.mail })
            if (admin) {
                bcrypt.compare(data.pass, admin.password).then((status) => {
                    if (status) {
                        console.log("login success");
                        resolve(response)
                    }
                    else {
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



    getAdminOtp: (adminData) => {
        let response = {}

        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADMIN_COLLECTION).findOne({ phone: adminData.number }).then((adminNumber) => {
                if (adminNumber) {
                    response.status = true
                    response.admin = adminNumber

                    client.verify.services(process.env.SERVICE_ID)
                        .verifications
                        .create({ to: `+91${adminData.number}`, channel: 'sms' })
                        .then((data) => {
                            resolve(response);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                }
                else {
                    response.status = false
                    resolve(response)
                }
            })
                .catch((error) => {
                    reject(error);
                });
        })
    },



    changeAdminPassword: (data, adminData) => {
        adminId = adminData._id

        return new Promise(async (resolve, reject) => {
            data.pass = await bcrypt.hash(data.pass, 10)
            db.get().collection(collection.ADMIN_COLLECTION).updateOne({ _id: new ObjectId(adminId) },
                {
                    $set: {
                        password: data.pass
                    }
                }
            )
                .then(() => {
                    client.verify.services(process.env.SERVICE_ID)
                        .verificationChecks
                        .create({
                            to: `+91${adminData.phone}`,
                            code: data.number,
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
        })
    }









}