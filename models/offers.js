/**
 * Created by Lazarus of Bethany on 05/05/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var offers = mongoose.Schema({
    idAdv: {type: Schema.ObjectId, ref: 'advs'},
    state: String,
    idInterested: {type: Schema.ObjectId, ref: 'users'},
    chat: [
        {
            owner: Boolean,
            message: String
        }
    ]
});

var Offer = mongoose.model('offers', offers);
module.exports=Offer