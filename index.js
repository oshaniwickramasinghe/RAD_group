const express=require("express");
const path= require("path");
const multer= require("multer");
const session= require("express-session");
const data=require("./data")
const passport=require("passport");
const passportlocal=require("passport-local");
const { response } = require("express");

const app=express();

// Function to serve all static files
// inside public directory.
app.use(express.static('views')); 

const Localstrategy=new passportlocal.Strategy(
    {
    usernameField:"email",
    }, 
    (email,password,done)=>{
    const user= data.users.find((user)=>user.email===email);
    if(!user){
        return done(null,false);
    }else{
        if(user.password!==password){
            return done(null,false);
        }else{
            return done(null,user.email);
        }
    }
});

passport.use(Localstrategy);

passport.serializeUser(function(user,done){
    done(null,user);
});

passport.deserializeUser(function(email,done){
    done(null,email);
});

app.set("views","./views");
app.set("view engine","ejs");

const storage= multer.diskStorage({
    destination:"./uploads",
    filename:(req, file, callback)=>{
        console.log("File name");
        callback(null,file.originalname);
    },
});

const upload=multer({storage});

app.use(
    session({
        secret:"secret",
        cookie:{
            maxAge:60*60*1000,
            httpOnly:false,
            secure:false,
        },
        saveUninitialized:true,
        resave:false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({extended:true}));

app.get("/",(req,res)=>{
    console.log(req.isAuthenticated());

        if(!req.session.pageVisitCount){
        req.session.pageVisitCount=1;
        }else{
        req.session.pageVisitCount=req.session.pageVisitCount+1;
        }

    console.log(req.session);
    res.render("index",{
        count:req.session.pageVisitCount,
    });
});

app.get("/login",(req,res)=>{
    res.render("login")
});

app.get("/next",(req,res)=>{
    res.render("upload");
});

app.post("/next",(req,res)=>{
    res.render("upload");
});

app.post("/upload",upload.single("avatar"),(req,res)=>{
    console.log(req.file);
    if(req.file){
        res.send({
            messsage:"your file is uploaded",
            
        });
    }else{
        res.send({
            messsage:"file upload failed",
        });
    }
})

app.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect:"/login",
        successRedirect: "/",
    }),
    (req,res)=>{}
    );
    
app.post("/logout",(req,res)=>{
    req.logOut(()=>{
        req.session.pageVisitCount=0
        res.redirect("/login");
    });
});

const PORT=3000;
app.listen(PORT,()=>{
    console.log(
        'server started listening on port ${PORT}\nVisit: http://localhost:${PORT}'
    );
});