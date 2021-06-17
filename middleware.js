const {campgroundSchema,reviewSchema}=require('./schemas.js');
const expressError=require('./utilities/expressError.js');
const wrapAsync=require('./utilities/wrapAsync');
const Campground=require('./models/campground');
const Review=require('./models/review');

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash('error','You must be signed in');
        req.session.returnTo=req.originalUrl;
        res.redirect('/login');
    }
    else next();
}

module.exports.validateForm=(req,res,next)=>{
    const {error}=campgroundSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',');
        throw new expressError(msg,400);
    }
    else{
        next();
    }
}

module.exports.validateReview=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',');
        throw new expressError(msg,400);
    }
    else{
        next();
    }
}

module.exports.isAuthor=wrapAsync(async (req,res,next)=>{
    const {id}=req.params;
    const camp=await Campground.findById(id);
    if(!camp.author.equals(req.user._id)){
        req.flash('error',"You don't have permission to do that");
        res.redirect(`/campgrounds/${camp._id}`);
    }
    else next();
})

module.exports.isReviewAuthor=wrapAsync(async (req,res,next)=>{
    const {id,reviewId}=req.params;
    const review=await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error',"You don't have permission to do that!");
        res.redirect(`/campgrounds/${id}`);
    }
    else next();
})