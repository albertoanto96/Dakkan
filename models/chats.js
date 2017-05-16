var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var chats = mongoose.Schema({
    id: Schema.ObjectId,
    name: String,
    chats: [],
    user1: {type: Schema.ObjectId, ref: 'users'},
    user2: {type: Schema.ObjectId, ref: 'users'},
    sellername:String,
    advname:String
});

var Chat = mongoose.model('chats', chats);
module.exports = Chat;