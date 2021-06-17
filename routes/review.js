const express=require('express');
const router=express.Router({mergeParams:true});
const wrapAsync=require('../utilities/wrapAsync');
const {isLoggedIn,validateReview,isReviewAuthor}=require('../middleware.js');
const review=require('../controllers/reviews');

router.route('/')
    .post(isLoggedIn,validateReview,wrapAsync(review.postReview));

router.route('/:reviewId')
    .delete(isLoggedIn,isReviewAuthor,wrapAsync(review.deleteReview));

module.exports=router;