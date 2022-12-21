const express = require("express")
const userController= require("../controller/userController")
const productController=require("../controller/productController")
const {Authentication,Authenthrization}= require("../auth/mid")
const router = express.Router()


const {createProduct,getProduct,getProductById} = require("../controller/productController")
const {createUser,loginUser,getUser,updateUser} = require('../controller/userController')
// 
const { Authentication, authorization } = require('../middlewares/auth')



router.post("/register",createUser)
router.post('/login', loginUser)