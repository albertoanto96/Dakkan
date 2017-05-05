/**
 * Created by Lazarus of Bethany on 05/05/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var users = mongoose.Schema({
    name: String,
    password: String,
    favorites: [{type: Schema.ObjectId, ref: 'advs'}],
    image: Boolean,
    active: Boolean,
    offers: [{type: Schema.ObjectId, ref: 'offers'}],
    reviews: [{type: Schema.ObjectId, ref: 'reviews'}],
    location: String
});
var User = mongoose.model('users', users);
module.exports = User;