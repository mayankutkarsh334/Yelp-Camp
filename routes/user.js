const express=require('express');
const router=express.Router();
const wrapAsync=require('../utilities/wrapAsync');
const passport=require('passport');
const user=require('../controllers/users');

router.route('/register')
    .get(user.registerForm)
    .post(wrapAsync(user.register));

router.route('/login')
    .get(user.loginForm)
    .post(passport.authenticate('local',{failureFlash:true, failureRedirect:'/login'}), user.login);

router.route('/logout')
    .get(user.logout);

module.exports=router;