const User = require("../models/user");

module.exports.renderSignupForm = (req,res)=>{
    res.render("users/signup.ejs");
};

module.exports.signup = async(req,res)=>{
    try{
        let{username, email, password} = req.body;
    const newUser = new User({username, email});
    const registeredUser = await User.register(newUser, password);//ye register method passport-local-mongoose se aata hai jo user ko register karta hai aur password ko hash karke store karta hai
    req.login(registeredUser, (err)=>{
        if(err){
            next(err);
        }
        req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listings");
    });
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs");
};

module.exports.login = async(req,res)=>{
    req.flash("success", "Welcome Back! You are successfully logged in.");
    let redirectUrl = res.locals.redirectUrl || "/listings";  //agar redirectUrl hai to usko wapas usi page pe bhej denge jaha se wo login karne ke liye aaya tha, agar redirectUrl nahi hai to usko listings page pe bhej denge
    res.redirect(redirectUrl);
};

module.exports.logout = (req,res,err)=>{
    req.logout((err)=>{
        if(err){
           next(err);
        }
        req.flash("success", "You have been logged out successfully.");
        res.redirect("/listings");
    })
};