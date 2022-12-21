const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")
const { uploadFile } = require("../aws/aws")
const bcrypt = require("bcrypt")
const validator = require("../Validators/validation")



//========================================== creating user ===========================================
const createUser = async function (req, res) {
    try {
        let requestBody = req.body;
        let files = req.files
        const { fname, lname, email, password, phone, address } = requestBody //Destructuring
        //=========================== if body is empty ==================================================
        if (!validator.isValidBody(requestBody)) return res.status(400).send({ status: false, msg: "Enter some data to create user" })

        //============================= validation for fname ============================================
        if (!fname) return res.status(400).send({ status: false, msg: "fname is mandatory" })
        if (!validator.isValidName(fname)) return res.status(400).send({ status: false, msg: "fname is not valid" })

        //===========================  validations for lname =============================================
        if (!lname) return res.status(400).send({ status: false, msg: "lname is mandatory" })
        if (!validator.isValidName(lname)) return res.status(400).send({ status: false, msg: "lname is not valid" })

        //=============================== validation for email ============================================
        if (!email) return res.status(400).send({ status: false, msg: "email is mandatory" })
        if (!validator.isValidEmail(email)) return res.status(400).send({ status: false, message: "Email is invalid" })
        let emailCheck = await userModel.findOne({ email: requestBody.email })
        if (emailCheck) return res.status(409).send({ status: false, msg: "email is already used " })
        requestBody.email = email.toLowerCase()

        //============================= validation for password ===================================================
        if (!password) return res.status(400).send({ status: false, msg: "password is mandatory" })
        if (!validator.isValidPassword(password)) return res.status(400).send({ status: false, message: "password is invalid ,it should be of minimum 8 digits and maximum of 15 and should have atleast one special character and one number & one uppercase letter" })
        requestBody.password = await bcrypt.hash(password, 10) //using bcrypt for password hashing

        //=========================== validation for phone ==================================================
        if (!phone) return res.status(400).send({ status: false, msg: "phone is mandatory" })
        if (!validator.isValidPhone(phone)) return res.status(400).send({ status: false, msg: "phone number is invalid , it should be starting with 6-9 and having 10 digits" })
        let phoneCheck = await userModel.findOne({ phone: requestBody.phone })
        if (phoneCheck) return res.status(409).send({ status: false, msg: "phone number is already used" })

        //============================== validation for profileimage =====================================
        if (files.length == 0) return res.status(400).send({ status: false, msg: "profileImage is mandatory" })
        let Image = await uploadFile(files[0]) // using aws for link creation 
        if (!validator.validImage(Image)) {
            return res.status(400).send({ status: false, msg: "profileImage is in incorrect format" })
        }
        requestBody.profileImage = Image

        //================================== validation for address =====================================
        if (!address) return res.status(400).send({ status: false, msg: "address is mandatory" })
        if (address) {
            let Address
            try {
                Address = JSON.parse(address)
            }
            catch (err) {
                return res.status(400).send({ status: false, message: "please provide adress in JSON object" })
            }
            if (typeof Address != "object") {
                return res.status(400).send({ status: false, message: "Address is in wrong format" })
            };
            if (Address.shipping) {
                if (typeof Address.shipping != "object") {
                    return res.status(400).send({ status: false, message: "Shipping Address is in wrong format" })
                }
                if (!Address.shipping.street) return res.status(400).send({ status: false, msg: "street is mandatory in Shipping" })
                if (!Address.shipping.city) return res.status(400).send({ status: false, msg: "city is mandatory in Shipping" })
                if (!Address.shipping.pincode) return res.status(400).send({ status: false, msg: "pincode is mandatory in Shipping" })
                if (!validator.isValidName(Address.shipping.city)) return res.status(400).send({ status: false, msg: "city name is not valid" })
                if (!validator.isValidPincode(Address.shipping.pincode)) return res.status(400).send({ status: false, msg: "Pincode is not valid" })
            }
            if (Address.billing) {
                if (typeof Address.billing != "object") {
                    return res.status(400).send({ status: false, message: "Shipping Address is in wrong format" })
                }
                if (!Address.billing.street) return res.status(400).send({ status: false, msg: "street is mandatory in billing" })
                if (!Address.billing.city) return res.status(400).send({ status: false, msg: "city is mandatory in billing" })
                if (!Address.billing.pincode) return res.status(400).send({ status: false, msg: "pincode is mandatory in billing" })
                if (!validator.isValidName(Address.billing.city)) return res.status(400).send({ status: false, msg: " city name is not valid" })
                if (!validator.isValidPincode(Address.billing.pincode)) return res.status(400).send({ status: false, msg: "Pincode is not valid" })
            }
        }
        requestBody.address = JSON.parse(requestBody.address)

        //=========================== user creation ==========================================
        let created = await userModel.create(requestBody)
        res.status(201).send({ status: true, msg: "User successfully created", data: created })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}




//========================================= user login =====================================================
const loginUser = async function (req, res) {
    try {
        let loginData = req.body
        let { email, password } = loginData

        //=========================== if body is empty ===============================================
        if (!validator.isValidBody(loginData)) return res.status(400).send({ status: false, message: "Please fill email or password" })
        //============================== if email not entered =======================================
        if (!validator.isValidEmail(email)) {
            return res.status(400).send({ status: false, message: `Please fill valid or mandatory email ` })
        }
        //============================ if password not entered ==========================================
        if (!password)
            return res.status(400).send({ status: false, message: `Please fill valid or mandatory password ` })

        //=============================== if user does not exist ===========================================
        let user = await userModel.findOne({ email: loginData.email });
        if (!user) {
            return res.status(404).send({ status: false, message: "User Not found" });
        }
        //============================== for password encryption ==============================================
        //comparing hard-coded password to the hashed password
        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            return res.status(400).send({ status: false, message: "wrong password" })
        }
        //=================================== token creation ================================================
        let token = jwt.sign({ "userId": user._id }, "project/booksManagementGroup05", { expiresIn: '24h' });


        return res.status(200).send({ status: true, message: "login successfully", data: { userId: user._id, token: token } })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


//================================= getting userdetails ===================================================
const getUser = async function (req, res) {
    try {
        let userId = req.params.userId;
        const user = await userModel.findOne({ _id: userId })
        return res.status(200).send({ status: true, message: 'User Details', data: user })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}



const updateUser = async function (req, res) {
    try {
        let userId = req.params.userId;
        let body = req.body
        let { fname, lname, email, phone, password, address } = body;
        let files = req.files
        const data = {};

        //========================== if no data is provided to update =====================================

        if (!(fname || lname || email || phone || password || address || files)) {
            return res.status(400).send({ status: false, message: "enter keys to update user." })
        }
        //============================== fname validation ========================================
        if (fname) {
            if (!validator.isValidName(fname)) return res.status(400).send({ status: false, msg: "fname is not valid" })
            let checkfname = await userModel.findOne({ fname: body.fname })
            if (checkfname) return res.status(400).send({ status: false, message: "The Same fname is already present" })
            data.fname = fname;
        }
        //=============================== lname validation ===========================================
        if (lname) {
            if (!validator.isValidName(lname)) return res.status(400).send({ status: false, msg: "lname is not valid" })
            let checklname = await userModel.findOne({ lname: body.lname })
            if (checklname) return res.status(400).send({ status: false, message: "The Same lname is already present" })
            data.lname = lname;
        }
        //================================ email validation ==========================================
        if (email) {
            if (!validator.isValidEmail(email)) return res.status(400).send({ status: false, message: "Please enter Valid email" })
            let emailData = await userModel.findOne({ email: body.email });
            if (emailData) return res.status(400).send({ status: false, message: "The email is already Present" })
            data.email = email.toLowerCase();
        }
        //========================== phone validation ==============================================
        if (phone) {
            if (!validator.isValidPhone(phone)) return res.status(400).send({ status: false, message: "Please enter Valid phone number" })
            let phoneData = await userModel.findOne({ phone: body.phone });
            if (phoneData) return res.status(400).send({ status: false, message: "The phone number is already Present" })
            data.phone = phone;
        }
        //================================ password validation ============================================
        if (password) {
            if (!validator.isValidPassword(password)) return res.status(400).send({ status: false, message: "Please enter valid password" })
            data.password = await bcrypt.hash(password, 10);
        }
        //==================================== address validation ============================================
        if (address) {
            let addressparse
            try {
                addressparse = JSON.parse(address)
            }
            catch (err) {
                return res.status(400).send({ status: false, message: "please provide adress in JSON object" })
            }
            
            if (typeof addressparse != "object") {
                return res.status(400).send({ status: false, message: "Address is in wrong format" })
            }

            if (addressparse.shipping) {
                if (typeof addressparse.shipping != "object") {
                    return res.status(400).send({ status: false, message: "shipping Address is in wrong format" })
                }
                if (addressparse.shipping.street) {
                    data["address.shipping.street"] = addressparse.shipping.street
                }
                if (addressparse.shipping.city) {
                    data["address.shipping.city"] = addressparse.shipping.city
                }
                if (addressparse.shipping.pincode) {
                    if (!validator.isValidPincode(addressparse.shipping.pincode)) return res.status(400).send({ status: false, message: "Please enter valid pincode" })
                    data["address.shipping.pincode"] = addressparse.shipping.pincode
                }
            }

            if (addressparse.billing) {
                if (typeof addressparse.billing != "object") {
                    return res.status(400).send({ status: false, message: "billing Address is in wrong format" })
                }
                if (addressparse.billing.street) {
                    data["address.billing.street"] = addressparse.billing.street
                }
                if (addressparse.billing.city) {
                    data["address.billing.city"] = addressparse.billing.city
                }
                if (addressparse.billing.pincode) {
                    if (!validator.isValidPincode(addressparse.billing.pincode)) return res.status(400).send({ status: false, message: "Please enter valid pincode" })
                    data["address.billing.pincode"] = addressparse.billing.pincode
                }

            }
        }
        //============================ profileimage validation ================================================
        if (files && files.length != 0) {
            let profileImgUrl = await uploadFile(files[0]);
            if (!validator.validImage(profileImgUrl)) {
                return res.status(400).send({ status: false, msg: "productImage is in incorrect format" })
            }
            data.profileImage = profileImgUrl;
        }
        //=============================== data updation ==================================================
        let update = await userModel.findOneAndUpdate({ _id: userId }, data, { new: true })
        return res.status(200).send({ status: true, message: "Successfully updated", data: update });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}



module.exports = { createUser, loginUser , getUser , updateUser }
