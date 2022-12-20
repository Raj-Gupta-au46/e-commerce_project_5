
const express = require("express")
const bodyParser = require('body-parser');
const route = require("./routes/route");
const { default : mongoose} = require ("mongoose");
const multer= require("multer");
mongoose.set('strictQuery', true);

const app = express();

app.use(bodyParser.json())

app.use(multer().any())

mongoose.connect("mongodb+srv://YuktaSadana:yuiopjkl@cluster0.ikfqj5s.mongodb.net/project-5",
 { useNewUrlParser : true}
)
.then(() => console.log("MongoDB is connected"))
.catch((err)=>console.log(err));


app.use("/", route);

app.listen(process.env.PORT || 3000 , function(){
   console.log("Express is running on Port" + (process.env.PORT || 3000))
});

