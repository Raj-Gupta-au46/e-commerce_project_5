const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({











    

},

{ timestamps: true });

module.exports = mongoose.model('User', userSchema)