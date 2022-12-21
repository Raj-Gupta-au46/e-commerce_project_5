const productModel = require('../models/productModel');
const validator = require("../validations/validator");
const { uploadFile } = require('../aws/aws');


//================================================ creating product ==============================================

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





//========================================== get product details =======================================

const getProduct = async function (req, res) {
    try {
        let queryData = req.query
        let { size, name, priceGreaterThan, priceLessThan, priceSort } = queryData
        //===========================if no query then filter with isDeleted:false========================
        if (Object.keys(queryData).length == 0) {
            let filterData = await productModel.find({ isDeleted: false })
            return res.status(200).send({ status: true,message: "Success", data: filterData })
        } 
        let keys = "size, name, priceGreaterThan, priceLessThan, priceSort"

        //============================= if query is present ============================================
        if (size || priceSort || priceLessThan || priceGreaterThan || name) {

            let objectFilter = { isDeleted: false }
            //================================ if size query is present ==========================================
            if (size) {
                let checkSizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]
                let arraySize = size.split(",")
                for (let i = 0; i < arraySize.length; i++) {
                    if (checkSizes.includes(arraySize[i])) {
                        continue;
                    }
                    else {
                        return res.status(400).send({ status: false, message: "Sizes should in this ENUM only S/XS/M/X/L/XXL/XL" })
                    }
                }
                objectFilter["availableSizes"] = { $in: arraySize }
            }
            //==================================== if name query is present ======================================
            if (name) {
                if (!validator.isValid(name)) return res.status(400).send({ status: false, message: "Name should not be empty" })
                name = name.replace(/\s+/g, ' ').trim()
                objectFilter["title"] = { $regex: name, $options: 'i' }
            }
            //=============================== if pricegreaterthen is present =========================
            if (priceGreaterThan) {
                if (!validator.isValid(priceGreaterThan)) return res.status(400).send({ status: false, message: "priceGreaterThan is empty" })
                if (!validator.isValidNumber(priceGreaterThan)) return res.status(400).send({ status: false, message: "You entered invalid priceGreaterThan.please enter number." })
                objectFilter["price"] = { $gt: priceGreaterThan }
            }
            //================================ if pricelessthen is present ====================================
            if (priceLessThan) {
                if (!validator.isValid(priceLessThan)) return res.status(400).send({ status: false, message: "priceLessThan is empty" })
                if (!validator.isValidNumber(priceLessThan)) return res.status(400).send({ status: false, message: "You entered invalid priceLessThan" })
                objectFilter["price"] = { $lt: priceLessThan }

            }
            //================== if both pricegreaterthan and pricelessthan is present ===================
            if (priceGreaterThan && priceLessThan) {
                objectFilter['price'] = { $gt: priceGreaterThan, $lt: priceLessThan }
            }
            //========================= if pricesort query is present ==================================
            if (priceSort) {
                if (validator.isValid(priceSort)) {
                    if (!(priceSort == "1" || priceSort == "-1")) return res.status(400).send({ status: false, message: "You entered an invalid input sorted By can take only two Inputs 1 OR -1" })
                }
            }

            //========================== fetching data using filters =======================================
            let findFilter = await productModel.find(objectFilter).sort({ price: priceSort })
            if (findFilter.length == 0) return res.status(404).send({ status: false, message: "No product Found" })

            return res.status(200).send({ status: true,message: "Success", data: findFilter })
        }
        else {
            return res.status(400).send({ status: false, message: `Cannot provide keys other than ${keys}` })
        }
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}




//=========================================== get product by productid ================================

const getProductById = async function (req, res) {
    try {
        let requestBody = req.params.productId
        if (!validator.isValidObjectId(requestBody)) {
            return res.status(400).send({ status: false, message: "productid is of invalid format" })
        }
        //===================================== getting non deleted data =================================
        let productCheck = await productModel.findOne({ _id: requestBody, isDeleted: false })
        if (!productCheck) {
            return res.status(404).send({ status: false, message: "product not found or the product is deleted" })
        }
        res.status(200).send({ status: true,message: "Success", data: productCheck })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}



module.exports = { createProduct, getProduct, getProductById }