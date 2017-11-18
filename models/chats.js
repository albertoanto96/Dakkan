var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var chats = mongoose.Schema({
    id: Schema.ObjectId,
    name: String,
    chats: [],
    user1: {type: Schema.ObjectId, ref: 'users'},
    user2: {type: Schema.ObjectId, ref: 'users'},
    sellername:String,
    advurl:String,
    advname:String,
    advid:{type: Schema.ObjectId, ref: 'advs'},
    buyer:String,
    closed:Boolean
});

var Chat = mongoose.model('chats', chats);
module.exports = Chat;

