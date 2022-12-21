const productModel = require('../models/productModel');
const validator = require("../Validators/validation");
const  uploadFile  = require('../aws/aws')


const createProduct = async function (req, res){
try{
let data= req.body
let files=req.files

if(!data || Object.keys(data).length==0) return res.status(400).send({status:false,msg : "data is not present in body"})

let { title,description,price,currencyId,currencyFormat,availableSizes,installments,isFreeShipping,style} = data

if(!title) return res.status(400).send({ status: false, msg: "title is not present" })
if(!description) return res.status(400).send({ status: false, msg: "description is not present" })
if(!price) return res.status(400).send({ status: false, msg: "price is not present" })
price=price*1
if(!currencyId) return res.status(400).send({ status: false, msg: "currencyId is not present" })
if(!currencyFormat) return res.status(400).send({ status: false, msg: "currencyFormat is not present" })
if(!availableSizes) return res.status(400).send({ status: false, msg: "availableSizes is not present" })

if(!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizes)) res.status(400).send({status:false,msg:"wrong availableSizes"})
if(currencyFormat!='₹') return res.status(400).send({ status: false, msg: "currencyFormat is not valid" })
if(currencyId!='INR') return res.status(400).send({ status: false, msg: "currencyId is not valid" })
if(!files || files.length==0) return res.status(400).send({ status: false, msg: "product Image is not present" })
if (!validator.isValidName(title)) return res.status(400).send({ status: false, msg: "fname is not valid" })
if (!validator.isValidName(description)) return res.status(400).send({ status: false, msg: "description is not valid" })

if(isFreeShipping){

    if(isFreeShipping!="true" || isFreeShipping!="false") return res.status(400).send({status:false,msg:"isFreeShiping value should true or false"})
    (isFreeShipping=="true") ? true : false 
}
if(style){
    if (!validator.isValidName(style)) return res.status(400).send({ status: false, msg: "style is not valid" })
}
// if(!validator.isValidPrice(price)) return res.status(400).send({status:false,msg:"price is not valid"})

if(installments){
installments=installments*1
    if(typeof installments != "number") return res.status(400).send({status:false ,msg:"installments should number"})
}

let uniqueTitle= await productModel.findOne({title:title})
if(uniqueTitle) return res.status(400).send({status:false,msg:"title should be unique"})

let imageLink= await uploadFile(files[0])
data.productImage=imageLink
if (!validator.validImage(imageLink)) {
    return res.status(400).send({ status: false, msg: "profileImage is in incorrect format" })
}
const productData = await productModel.create(data)

return res.status(201).send(productData)

}
catch(err){
return res.status(500).send({status:false,msg:err.message})
}
}


module.exports={createProduct}