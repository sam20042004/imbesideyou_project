const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
// Register
router.post("/register", async(req,res)=>{
    

    try{
        //generating new password.
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password,salt);

        // creating new user
        const newUser = await new User({
            username : req.body.username,
            email : req.body.email,
            password : hashedPassword
        })


        // save user and sending response.
        const user = await newUser.save();
        res.status(200).json(user);
    } 
    
    catch(err){
        res.status(500).json(err);
    }
})

// LOGIN

router.post("/login", async(req,res)=>{
    try{

        // checking if the email is correct
        const user = await User.findOne({email : req.body.email});
        if(!user) {
            res.status(404).json("user not found");
        }

        // checking for the password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if(!validPassword) {
            res.status(400).json("Wrong Password");
        }

        // if both check passed then just return the user.
        res.status(200).json(user);
    }
    
    catch(err){
        res.status(500).json(err);
    }
})

module.exports = router;