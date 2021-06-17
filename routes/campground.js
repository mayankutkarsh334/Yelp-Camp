const express=require('express');
const router=express.Router();
const wrapAsync=require('../utilities/wrapAsync');
const {isAuthor,isLoggedIn,validateForm}=require('../middleware.js');
const campground=require('../controllers/campgrounds');
const multer=require('multer');
const {storage}=require('../cloudinary/index');
const upload=multer({storage});

router.route('/')
    .get(wrapAsync(campground.index))
    .post(isLoggedIn,upload.array('image'),validateForm,wrapAsync(campground.postCampground));

router.route('/new')
    .get(isLoggedIn,campground.renderNewForm);

router.route('/:id')
    .get(wrapAsync(campground.renderCampground));

router.route('/:id/edit')
    .get(isLoggedIn,isAuthor,wrapAsync(campground.renderEditForm))
    .put(isLoggedIn,isAuthor,upload.array('image'),validateForm,wrapAsync(campground.putEdit));

router.route('/:id/delete')
    .delete(isLoggedIn,isAuthor,wrapAsync(campground.deleteCampground));

module.exports=router;

