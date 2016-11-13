var mongoose = require('mongoose');


var customerSchema = new mongoose.Schema({
    name: String,
    badge: Number,
    dob: { type: Date, default: Date.now },
    isloved: Boolean
});


module.exports = mongoose.model('Customer', customerSchema);