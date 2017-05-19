/**
 * Created by Lazarus of Bethany on 05/05/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var users = mongoose.Schema({
    facebookId:String,
    facebookToken:String,
    facebookName:String,
    name: String,
    password: String,
    favorites: [{type: Schema.ObjectId, ref: 'advs'}],
    image: Boolean,
    active: Boolean,
    reviews: [{type: Schema.ObjectId, ref: 'reviews'}],
    location: String,
    revpending:[]
});
var User = mongoose.model('users', users);
module.exports = User;