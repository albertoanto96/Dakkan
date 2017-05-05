/**
 * Created by Lazarus of Bethany on 05/05/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var advs = mongoose.Schema({
    id: Schema.ObjectId,
    title: String,
    description: String,
    exchange: String,
    category: String,
    owner: {type: Schema.ObjectId, ref: 'users'},
    imageurl: String
});

var Adv = mongoose.model('advs', advs);
module.exports = Adv;