
let adminSession = (req , res , next) =>{
    if(req.session.adminLoggin){
        next()
    }
    else{
        res.redirect('/admin/login')
    }
}


let userSession = (req , res , next) => {
    if(req.session.loggedIn){
        next()
    }
    else{
        res.redirect('/login')
    }
}


module.exports = {
    adminSession,
    userSession
}