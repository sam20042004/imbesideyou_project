const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require("../models/user")

// Update User
router.put('/:id', async(req,res)=>{
    if(req.body.userId === req.params.id || req.body.isAdmin){
        if(req.body.password){
            try{
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            }
            catch(err){
                return res.status(500).json(err);
            }
        }

        try{
            const user = await User.findByIdAndUpdate(req.params.id,{
                $set : req.body
            });

            res.status(200).json("Account Updated Successfully!");
        }
        catch(err){
            return res.status(500).json(err);
        }
    } else{
        return res.status(403).json("You can update only your account");
    }
})

// Delete User

router.delete('/:id', async(req,res)=>{
    if(req.body.userId === req.params.id || req.body.isAdmin){

        try{
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account Deleted Successfully!");
        }
        catch(err){
            return res.status(500).json(err);
        }
    } 
    
    else{
        return res.status(403).json("You can delete only your account");
    }
})

// Get a User

router.get("/", async(req,res)=>{
    const userId = req.query.userId;
    const username = req.query.username;
    try{
        const user = userId
         ? await User.findById(userId)
         : await User.findOne({username:username});
        const {password, updatedAt, ... other} = user._doc     // if we don't want to send all the details then we can do it by using this line.
        // res.status(200).json(user);
        res.status(200).json(other);    // this will send the user without the password and updatedAt fields.
    }
    catch(err){
        res.status(500).json(err);
    }
})

// Get Friends

router.get("/friends/:userId", async(req,res)=>{
    try{
        const user = await User.findById(req.params.userId);
        const friends = await Promise.all(
            user.followings.map((friendId)=>{
                return User.findById(friendId);
            })
        )

        let friendList = [];
        friends.map(friend =>{
            const {_id, username, profilePicture} = friend;
            friendList.push({_id,username,profilePicture});
        })

        res.status(200).json(friendList);
    }
    catch{

    }
})

// Follow a User

router.put("/:id/follow", async(req,res) =>{
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if(!user.followers.includes(req.body.userId)){
                await user.updateOne({$push: {followers : req.body.userId}});
                await currentUser.updateOne({$push: {followings : req.params.id}});
                res.status(200).json("You follow the user.")
            }

            else{
                res.status(403).json("You already follow this user.");
            }
        }
        catch(err){
            res.status(500).json(err);
        }
    }

    else{
        res.status(403).json("You can't follow yourself");
    }
})

// Unfollow a User

router.put("/:id/unfollow", async(req,res) =>{
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if(user.followers.includes(req.body.userId)){
                await user.updateOne({$pull: {followers : req.body.userId}});
                await currentUser.updateOne({$pull: {followings : req.params.id}});
                res.status(200).json("You don't follow the user anymore.")
            }

            else{
                res.status(403).json("You don't follow this account.");
            }
        }
        catch(err){
            res.status(500).json(err);
        }
    }

    else{
        res.status(403).json("You can't unfollow yourself");
    }
})

module.exports = router;