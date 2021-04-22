// import package mongoose
const mongoose = require('mongoose');

// package uniqueValidator
const uniqueValidator = require('mongoose-unique-validator');


// creation schema mongoose user
const userSchema = mongoose.Schema({
    email : {type: String, 
        requiered: true, 
        unique: true, 
    },
    password: {
        type: String, 
        requiered: true}
});

// package pour garantir un email unique
userSchema.plugin(uniqueValidator);

// export modèle userSchema
module.exports = mongoose.model('User', userSchema);
