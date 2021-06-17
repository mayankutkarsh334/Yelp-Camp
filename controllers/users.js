const User=require('../models/user');

module.exports.registerForm=(req,res)=>{
    res.render('./user/register');
}

module.exports.register=async (req,res)=>{
    try{
        const {email,username,password}=req.body;
        const user=new User({username,email});
        const registeredUser=await User.register(user,password);
        req.login(registeredUser,err=>{
            if(err) return next(err);
            req.flash('success','You are Logged In');
            const redirectUrl=req.session.returnTo || '/campgrounds';
            delete req.session.returnTo;
            res.redirect(redirectUrl);
        })
    }
    catch(e){
        req.flash('error',e.message);
        res.redirect('/register');
    }
}

module.exports.loginForm=(req,res)=>{
    res.render('./user/login');
}

module.exports.login=(req,res)=>{
    req.flash('success','You are Logged In');
    const redirectUrl=req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout=(req,res)=>{
    req.logout();
    req.flash('success','You are Logged Out');
    res.redirect('/campgrounds');
}