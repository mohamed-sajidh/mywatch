var createError = require('http-errors');
var express = require('express');
var path = require('path');
// var fileUpload = require('express-fileupload')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var db=require('./config/connection')
var hbs = require('express-handlebars')
var multer = require('multer')
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var session= require('express-session')
const flash = require('connect-flash');
var app = express();
var upload = multer({ dest: 'uploads/' })
const Handlebars = require('handlebars')


// app.engine('hbs',hbs.engine({extname:'hbs', defaultLayout:'layout',layoutsDir:_dirname+'/views/layout/',partialsDir:_dirname+'/views/Partials/',
// helpers: {
//   isEqual: (status, value, options) => {
//     if (status == value) {
//       return options.fn(this)
//     }
//     return options.inverse(this)
//   },
//     math: function (lvalue, operator, rvalue) {
//       lvalue = parseFloat(lvalue);
//       rvalue = parseFloat(rvalue);
//       return {
//         "+": lvalue + rvalue,
//         "-": lvalue - rvalue,
//         "*": lvalue * rvalue,
//         "/": lvalue / rvalue,
//         "%": lvalue % rvalue
//       }[operator];
//     }
//   }
// }
// ))


app.use(bodyParser.json())
// app.use(fileUpload())
// view engine setup
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))
Handlebars.registerHelper('isEqual', function (a, b, options) {
  if (a === b) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});
app.use(session({secret:"key",cookie:{maxAge:600000000}}))
app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
db.connect((err)=>{
  if(err) console.log('Connection error'+err);
  else console.log('Database connected to port 27017');
})
app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
