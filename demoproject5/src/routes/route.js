const express = require("express")
const userController= require("../controller/userController")
const {Authentication,Authenthrization}= require("../auth/mid")
const router = express.Router()











router.post("/register",createUser)
router.post('/login', loginUser)
router.get("/user/:userId/profile",Authentication,userController.getUserData)


















router.all("/*",(_,res)=>{
    return res.status(400).send({status:false,msg:"your end point is not correct"})
})