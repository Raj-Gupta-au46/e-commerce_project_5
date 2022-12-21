const express = require("express")
const userController= require("../controller/userController")
const productController=require("../controller/productController")
const {Authentication,Authenthrization}= require("../auth/mid")
const router = express.Router()











router.post("/register",userController.createUser)
router.post('/login', userController.loginUser)
router.get("/user/:userId/profile",Authentication,userController.getUserData)
router.put("/user/:userId/profile",userController.updateUser)
router.post("/products",productController.createProduct)
















router.all("/*",(_,res)=>{
    return res.status(400).send({status:false,msg:"your end point is not correct"})
})





module.exports=router