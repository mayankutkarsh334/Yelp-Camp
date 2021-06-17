const Reviews=require('../models/review');
const Campground=require('../models/campground');

module.exports.postReview=async (req,res)=>{
    const id=req.params.id;
    const review=new Reviews(req.body);
    review.author=req.user._id;
    const camp=await Campground.findById(id);
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${id}`);
}

module.exports.deleteReview=async (req,res)=>{
    const {id,reviewId}=req.params;
    await Reviews.findByIdAndDelete(reviewId);
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
}