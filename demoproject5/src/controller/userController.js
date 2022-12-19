const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")


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
        let token = jwt.sign({ "userId": user._id }, "project/booksManagementGroup43", { expiresIn: '24h' });


        return res.status(200).send({ status: true, message: "login successfully", data: { userId: user._id, token: token } })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}





module.exports = { createUser, loginUser }
