if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}

const express=require('express');
const path=require('path');
const mongoose=require('mongoose');
const session=require('express-session');
const flash=require('connect-flash');
const methodOverride=require('method-override');
const expressError=require('./utilities/expressError');
const ejsMate=require('ejs-mate');
const campground=require('./routes/campground');
const review=require('./routes/review');
const user=require('./routes/user');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user');
const mongoSanitize=require('express-mongo-sanitize');
const helmet=require('helmet');
const MongoDBStore = require("connect-mongo");

const app=express();

const dbUrl=process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we're connected!");
});

const secret=process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoDBStore({
    mongoUrl: dbUrl,
    secret: secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConf={
    store:store,
    name:'session',
    secret:secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expire:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(methodOverride('_method'));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname,'public')));
app.use(session(sessionConf));
app.use(flash());
app.use(mongoSanitize({
    replaceWith:'_'
}))
app.use(helmet({
    contentSecurityPolicy:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

app.get('/',(req,res)=>{
    res.render('home');
})

app.use('/',user)
app.use('/campgrounds',campground);
app.use('/campgrounds/:id/review',review);


app.all('*',(req,res,next)=>{
    next(new expressError("Page Not Found",404));
})

app.use((err,req,res,next)=>{
    const {statusCode=500}=err;
    if(!err.message) err.message="Something went wrong!!!";
    res.status(statusCode).render('campgrounds/error',{err});
})

app.listen(8000,()=>{
    console.log('listening at port 8000');
})
