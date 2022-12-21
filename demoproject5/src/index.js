
const express = require("express")

const route = require("../demoproject5/src/routes/route");
const { default : mongoose} = require ("mongoose");
<<<<<<< HEAD:demoproject5/index.js
const multer = require("multer")
=======
const multer= require("multer");
mongoose.set('strictQuery', true);
>>>>>>> 6246550d4999973cf3c26968a81f143d866be1b1:demoproject5/src/index.js

const app = express();
mongoose.set('strictQuery', true);
app.use( multer().any())
app.use(express.json())

<<<<<<< HEAD:demoproject5/index.js


mongoose.connect("mongodb+srv://YuktaSadana:yuiopjkl@cluster0.ikfqj5s.mongodb.net/project05",
=======
app.use(bodyParser.json())

app.use(multer().any())

mongoose.connect("mongodb+srv://YuktaSadana:yuiopjkl@cluster0.ikfqj5s.mongodb.net/project-5",
>>>>>>> 6246550d4999973cf3c26968a81f143d866be1b1:demoproject5/src/index.js
 { useNewUrlParser : true}
)
.then(() => console.log("MongoDB is connected"))
.catch((err)=>console.log(err));


app.use("/", route);

app.listen(process.env.PORT || 3000 , function(){
   console.log("Express is running on Port" + (process.env.PORT || 3000))
});

