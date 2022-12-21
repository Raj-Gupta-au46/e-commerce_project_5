const express = require("express")
const router = express.Router()


const {createProduct,getProduct,getProductById} = require("../controller/productController")
const {createUser,loginUser,getUser,updateUser} = require('../controller/userController')
// 
const { Authentication, authorization } = require('../middlewares/auth')



//=================================== user apis ===============================================
router.post("/register",createUser)
router.post('/login', loginUser)
router.get("/user/:userId/profile",Authentication, authorization, getUser)
router.put("/user/:userId/profile", Authentication, authorization, updateUser)


//================================== product apis ============================================

router.post("/products",createProduct)
router.get("/products",getProduct)
router.get('/products/:productId', getProductById)



module.exports = router