const jwt = require('jesonwebtoken');
const { default: mongoose } = require('mongoose');
const userModel = require('../models/userModel');


const Authentication= async (req,res,next)=> {

const header=req.headers["x-api-key"]
if(!header) return res.status(400).send({status:false,msg:"header is not present"})

jwt.verify(header,"project/booksManagementGroup43",(err,token)=>{
    if(err) return res.status(401).send({status:false , msg :"token is not valid"})

    else{

        req.userId=token
        next()
    }
})

}



const Authenthrization= async(req,res,next)=>{

 let userId1=req.params.userId
let userId=req.userId

if(!userId1) return res.status(400).send({status:false,msg : "user id is no present"})
if(mongoose.isValidObjectId(userId1)) return res.status(403).send({status:false,msg:"userId is not valid"})

const userData= await userModel.findOne({_id:userId1})
if(!userData) return res.status(404).send({status :false,msg:"user is not present"})

if(userId!= userId1)  return res.status(403).send({status :false,msg:"ooh you r not autherized user"})

next()

}


module.exports={Authentication,Authenthrization}