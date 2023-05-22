const mongoClient = require('mongodb').MongoClient
const state = {db:null}

module.exports.connect = function(done){
    // const url ='mongodb://127.0.0.1:27017';
    // const url = 'mongodb+srv://Sajidh:Sajidh@123@cluster0.lkctwtj.mongodb.net/?retryWrites=true&w=majority'
    const url = 'mongodb+srv://sajidhshaji4:Sajidh123@cluster0.hixpkch.mongodb.net/'
    const dbname = 'newProject'

    mongoClient.connect(url,{ useUnifiedTopology: true },(err, data)=>{
        if(err) return done(err)
        state.db = data.db(dbname)
        done()
    }) 
}

module.exports.get = function(){
    return state.db
}  