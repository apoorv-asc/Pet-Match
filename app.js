var express         =require("express");
var bodyParser      =require("body-parser");
var mongoose        =require("mongoose");
var methodOverride  =require("method-override");
var swal            =require("sweetalert");

app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

app.set("view engine","ejs");

mongoose.connect('mongodb://localhost:27017/pet_app', {useNewUrlParser: true, useUnifiedTopology: true});
var petSchema=new mongoose.Schema({
    name:String,
    url:String,
    life:String,
    male_weight:String,
    female_weight:String
});
var pet=mongoose.model("pet",petSchema);

// ========= PASSPORT ========
var passport             = require("passport");
var LocalStrategy        = require("passport-local");
var passportLocalMongoose= require("passport-local-mongoose");
var User                 = require("./models/user")   
app.use(require("express-session")({
    secret:"Yeh Jawani Hai Deewani",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ===========
//  FUNCTION
// ===========
function isLoggedIn(req,res,next){
    // req.user contains the details about the user
    if(req.isAuthenticated()){
        return next();
    }
    else{
    res.render("loginrq");
    }
};

// Write above thing first followed by the ↓ thing or else it won't pass updated info to ejs

app.use(function(req,res,next){
    res.locals.user=req.user;
    next();
})

app.listen(27017,process.env.IP,function()
{
    console.log("Server has started");
});

// ================
//     ROUTES
// ================

app.get("/",function(req,res){
    res.render("cover.ejs");
});

// ======= SIGN-UP =======
app.get("/signup",function(req,res){
    res.render("signup");
});

app.post("/signup",function(req,res){
    User.register(new User({username:req.body.username}),req.body.password, function(err,user){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/dogs");
            })
        }
    })
});


// ======= LOGIN =======
app.get("/signin",function(req,res){
    res.render("signin");
});

app.post("/signin",passport.authenticate("local",{
    successRedirect:"/dogs",
    failureRedirect:"/"
}) ,function(req,res){
});

//======== Logout ========
app.get("/logout",function(req,res){
    req.logOut();
    res.redirect("/dogs");
});


app.get("/dogs",function(req,res)
{
    pet.find({},function(err,allpets){
        if(err)
        console.log(err);
        else
        res.render("index.ejs",{dogs:allpets});
    })
});

app.post("/dogs", isLoggedIn, function(req,res){
    pet.create({
        name:req.body.breed,
        url:req.body.url,
        life:req.body.life,
        male_weight:req.body.male_weight,
        female_weight:req.body.female_weight
    },function(err,pet){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/dogs");
        }
    });
    
});

app.get("/dogs/new",isLoggedIn ,function(req,res)
{
    res.render("form.ejs");
});

app.get("/dogs/edit",isLoggedIn ,function(req,res){
    pet.find({},function(err,allpets){
        if(err)
        console.log(err);
        else
        res.render("editindex.ejs",{dogs:allpets});
    })
});

app.get("/dogs/:_id",function(req,res){
    pet.findById(req.params._id,function(err,foundDog){
        if(err){
            res.redirect("index.ejs")
        }
        else{
            res.render("show.ejs",{dog:foundDog});
        }
    })
});

app.get("/dogs/:_id/delete",isLoggedIn, function(req,res){
    pet.findByIdAndDelete(req.params._id,function(err){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/dogs");
        }
    })


});


app.put("/dogs/:_id", isLoggedIn, function(req,res){
    pet.findByIdAndUpdate(req.params._id,req.body.epet,function(err,updated){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/dogs/"+req.params._id);
        }
    });
});

app.get("/dogs/:_id/edit",isLoggedIn, function(req,res){
    pet.findById(req.params._id,function(err,foundPet){
        res.render("edit.ejs",{dog:foundPet});
    })
});

// cover.ejs      - Cover page
// index.ejs      - The page that displays all the pic and name of various dogs
// show.ejs       - Shows all the details about a particular dog
// form.ejs       - Form to enter the details of the dog
// edit.ejs       - Form to edit the details of the dog
// editindex.ejs  - Asks the user if they want to edit details/delete the dog
// loginrq.ejs    - This page request the user to either Login or sign-up
