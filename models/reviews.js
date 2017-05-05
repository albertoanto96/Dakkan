/**
 * Created by Lazarus of Bethany on 05/05/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var reviews = mongoose.Schema({
    title: String,
    description: String,
    rating: Number,
    reviewername:String,
    reviewerid:String
});

var Review=mongoose.model('reviews',reviews);
module.exports = Review;