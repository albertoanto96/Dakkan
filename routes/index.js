var express = require('express'),
    IMGR = require('imgr').IMGR;
var bodyParser = require( 'body-parser' );
var app = express();
var username = "";
app.use( bodyParser.urlencoded({ extended: true }) );
var passport= require('passport')
var mongoose = require('mongoose');
var fs = require('fs');
var multer = require('multer');
var Hash = require('jshashes');
var cors = require('cors');
var session = require('express-session')
var server = require('http').createServer(app);
var io = require('socket.io')(server);
module.exports=app;
require('../config/passport')(passport);
var localStorage = require('localStorage')
app.use(session({ secret: 'zasentodalaboca' })); // session secret
app.use(passport.initialize());
app.use(passport.session());
var path = require('path');

var Schema = mongoose.Schema;
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null,path.resolve(__dirname,'../public/img/profiles'));
    },
    filename: function (req, file, callback) {
            callback(null, req.body.id + ".png");

    }
});
var storageadv = multer.diskStorage({

    destination: function (req, file, callback) {
        callback(null,path.resolve(__dirname,'../public/img/advs'));
    },
    filename: function (req, file, callback) {
            callback(null, req.body.name + ".png");
    }
});

mongoose.connect("mongodb://localhost:27017/dakkan", function (err) {
    if (!err) {
        console.log("We are connected")
    }
});
var User =require('../models/users');
var Adv = require('../models/advs')
var Offer = require('../models/offers')
var Review = require('../models/reviews')
var Chat=require('../models/chats')

var u;
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());
app.use(function (req, res, next) {
res.header("Access-Control-Allow-Origin",  "*");
res.header('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS");
res.header('Access-Control-Allow-Headers', "Content-Type, Authorization, Content-Length, X-Requested-With,X-Custom-Header,Origin");
res.header('Access-Control-Allow-Credentials',"true")
next();
});
var upload = multer({storage: storage}).single('file');
var uploadadv = multer({storage: storageadv}).single('file');
var imgr = new IMGR({debug:false});

//Se ha de instalar graphicsmagick si se quiere probar desde un ordenador que no sea producción
//Para instalarlo: http://www.graphicsmagick.org/README.html

    imgr.serve(path.resolve(__dirname,'../public/img/advs'))
    .namespace('/images')
    .urlRewrite('/:path/:size/:file.:ext')
    .whitelist([ '','200x300', '100x100','150x','389x400'])
    .using(app);

    imgr.serve(path.resolve(__dirname,'../public/img/profiles'))
    .namespace('/imagesprof')
    .urlRewrite('/:path/:size/:file.:ext')
    .whitelist([ '','200x300', '100x100','150x','389x400'])
    .using(app);

var messages=[];
var users=[];
io.on('connection', function (socket) {
    socket.on('room', function(room) {
        socket.join(room);
        console.log("gente en la room");
        var clients = io.sockets.adapter.rooms[room].sockets;
        //to get the number of clients
        var numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;
       console.log(numClients);

        console.log("usuarios conectados");
        console.log(io.engine.clientsCount)
    });
    socket.on('newmsg',function (data) {
        console.log("newmsg");

        Chat.findOne({name:data.room},function (err, chat) {
            if(data.author===chat.sellername){
                for(i=0;i<users.length;i++){
                    if(users[i].user===chat.buyer){
                        io.to(users[i].socket).emit('notification',data.author);
                    }

                }
            }
            if(data.author===chat.buyer){
                for(i=0;i<users.length;i++){
                    if(users[i].user===chat.sellername){
                        io.to(users[i].socket).emit('notification',data.author)
                    }
                }
            }
        });
        messages.push(data);
        Chat.update({name: data.room}, {$push: {chats: data}}, function (err, upd) {
        });
        io.sockets.in(data.room).emit('messages', data);
    });
    socket.on('user',function (user) {
        console.log("se une un nuevo usuario");
        var usr={user:user,socket:socket.id};
        users.push(usr);
    });

});

server.listen(3000);

app.get('/', function (req, res,next) {
    res.render('index', {title: 'OAuth example: facebook'});
    res.sendFile(__dirname + "/adv.html");
});
app.get('/FProfile',isAuth,function (req,res,next) {
    res.render('profile', {title:'Your profile page', user: req.user});
});
app.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/');
});
app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['public_profile', 'email'] }));

app.post('/auth/facebookionic',function (req,res) {
    // check if the user is already  logged in
    if (req.body.facebookName != undefined) {

        User.findOne({ 'facebookId'  : req.body.facebookId }, function(err, user) {
            if (err)
                return done(err);

            if (user!=null) {

                // if there is a user  id already but no token (user was linked at one point and then removed)
                if  (!user.facebookToken) {
                    user.facebookToken = req.body.facebookToken;
                    user.facebookName  =  req.body.facebookName;
                    user.save(function(err) {
                        if (err)
                            throw  err;
                        res.send(user);
                    });
                }
                res.send(user);
                 // user found, return that user
            } else {
                // if there is no  user, create them
                var newUser            = new User();
                newUser.facebookId    =  req.body.facebookId;
                newUser.facebookToken =  req.body.facebookToken;
                newUser.facebookName  =  req.body.facebookName;
                newUser.active=true;
                newUser.image=false;
                newUser.name=req.body.facebookName;
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    res.send(newUser);
                });
            }
        });

    } else {
            res.send("");
    }

});

app.get('/localprofile', isAuth, function(req, res)  {
    res.render('profile.html', {
        user : req.user
    });
});
//handle the callback after facebook has authenticated the user

app.get('/auth/facebook/callback', passport.authenticate('facebook',{
    successRedirect: '/#!/Perfil',
    failureRedirect: '/#!/Anuncios'
}));
app.post('/facebook',function (req,res) {
    if(req.body.name!="") {
        res.send(localStorage.getItem('facebookAuth'))
    }
    else res.send("")
})

app.post('/logout',function (req,res) {

    localStorage.removeItem('facebookAuth')
    username="";
    res.send("200")
})
function isAuth(req, res, next) {
    if (req.isAuthenticated())
        return next();
// otherwise, send her back to home
    res.redirect('/');
}

app.post('/upload', function (req, res){
    upload(req, res, function (err) {
        if (err) {
	 console.log("ERROR Subiendo foto perfil");
	return res.send("Error uploading file.");
        }
        else{
            if(req.body.file != undefined){
                var base64Data = req.body.file;
                fs.writeFile("./public/img/profiles/"+req.body.id+".png", base64Data, 'base64', function(err) {
                    if (err){
                        console.log(err);
                        res.send("500");
                    }
                    fs.readFile("./public/img/profiles/"+req.body.id+".png", function(err, data) {
                        if (err) {
                            throw err;
                            res.send("500");
                        }
                    });
                });

            }
            User.findOneAndUpdate({name: req.body.name}, {$set:{image: true}}).then(function (response) {
                res.send("File is uploaded");
            });
        }

    });
});




app.post('/uploadadv', function (req, res) {
    uploadadv(req, res, function (err) {
        if (err) {
            return res.send("Error uploading file.");
        }
        else{
            if(req.body.file != undefined)
            {
                var base64Data = req.body.file;
                fs.writeFile("./public/img/advs/"+req.body.name+".png", base64Data, 'base64', function(err) {
                    if (err) console.log(err);
                    fs.readFile("./public/img/advs/"+req.body.name+".png", function(err, data) {
                        if (err) throw err;
                    });
                });
            }
            res.send("File is uploaded");
        }
    });
});

app.post('/getreviews', function(req, res) {
    var userid=req.body.id;
    // use mongoose to get all reviews in the database
    User.find({_id:userid},function(err, user) {
        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err);
        Review.populate(user,{path:"reviews"},function (err, rev) {
           try {
               res.json(user[0].reviews);
           }
catch (Exception){}
        })
        // return all reviews in JSON format
    });
});

// create review and send back all reviews after creation
app.post('/postreview', function(req, res) {

    // create a review, information comes from request from Ionic
    var r=new Review({title:req.body.title,description:req.body.description,rating:req.body.rating,reviewername:req.body.reviewername,
        reviewerid:req.body.reviewerid});
    r.save(function (err, rev) {
        User.findOneAndUpdate({name: req.body.usrname},{$push: {reviews: rev.id}},function (err, result) {
            User.find({_id:req.body.reviewerid},function(err,result){
                var rev = [];
                for(var i=0;i<result[0].revpending.length;i++) {
                    if(result[0].revpending[i].name == req.body.usrname){

                    }
                    else{
                        rev.push(result[0].revpending[i])
                    }
                }
                User.findOneAndUpdate({_id:req.body.reviewerid},{$set:{revpending:rev}},function (err,result) {
                    res.send("ok");
                });
            });
        });
    });
});


// delete a review
app.post('/deletereview', function(req, res) {

    Review.remove({_id : req.body.review_id}, function(err, review) {
        User.update({name: req.body.name}, {$pull: {reviews: req.body.review_id}}, function (err, upd) {
             res.send("ok");
        });
    });
});
app.post('/push', function (req, res) {
    User.find({name: req.body.name}).then(function (response) {
        if (response[0] != undefined) {
            if (response[0].active != true) {
                User.findOneAndUpdate({name: req.body.name}, {active: true}).then(function (response) {
                    res.send(response);
                });
            }
            else {
                res.send("500");
            }
        }
        else {
            var pass = req.body.password;
            var passhash = new Hash.SHA256(pass).hex(pass);
            u = new User({name: req.body.name, password: passhash, image: false, active: true});
            u.save().then(function () {
                User.find({name: req.body.name}).then(function (response) {
                    res.send(response);
                });
            });

        }
    });

});

app.post('/login', function (req, res) {
    var pass = req.body.password;
    var passhash = new Hash.SHA256(pass).hex(pass);
    User.find({name: req.body.name, password: passhash, active: true}).then(function (response) {
        username = req.body.name;
        if (response.length===0)
            response = "no login";
        res.send(response);
    });
});
app.put('/updatePass', function (req, res) {
    var passold = req.body.password;
    var passhashold = new Hash.SHA256(passold).hex(passold);
    var passnew = req.body.new;
    var passhashnew = new Hash.SHA256(passnew).hex(passnew);
    User.findOneAndUpdate({
        name: req.body.name,
        password: passhashold
    }, {password: passhashnew}).then(function (response) {
        if(response != null) {
            res.send("200");
        }
        else{
            res.send("500");
        }
    });
});

app.put('/updateName', function (req, res) {
    User.find({name: req.body.new}).then(function (response) {
        if (response[0] == undefined) {
            User.findOneAndUpdate({name: req.body.name}, {name: req.body.new}).then(function (response) {
                if(response != null) {
                    res.send("200");
                }
                else{
                    res.send("500");
                }
            });
        }
        else {
            console.log("esto es lo que pasa cuando repites nombre");
            res.send("500");
        }
    })

});

app.put('/updateLocation',function (req, res) {

            User.findOneAndUpdate({name: req.body.name}, {location:req.body.location}).then(function (response) {
                if(response != null) {
                    res.send("200");
                }
                else{
                    res.send("500");
                }
            });
})

app.delete('/delete', function (req, res) {
    var pass = req.body.password;
    var passhash = new Hash.SHA256(pass).hex(pass);
    User.findOneAndUpdate({name: req.body.name, password: passhash}, {active: false}, function (err, response) {
        if (response != null) {
            res.sendStatus(200);
        }
        else {
            res.sendStatus(500);
        }
    });
});
app.post('/getOwnerImage', function (req,res) {

    var users = [];
    User.find({name:req.body.name},function (err, usuarios) {
        if(usuarios.length>0)
     res.send(usuarios[0].image);

    });
});

app.post('/isfavorite', function (req, res) {
    var advid =mongoose.Types.ObjectId(req.body.advid);
    User.find({name: req.body.name, favorites: advid}, function (err, usuario) {
        console.log("usuario:", usuario);
        res.send(usuario);
    })
});

app.post('/addfavorite', function (req, res) {


    User.update({name: req.body.name}, {$push: {favorites: req.body.advid}}, function (err, upd) {

        res.send("Added to favorites");

    })

});
app.post('/deletefavorite', function (req, res) {


    User.update({name: req.body.name}, {$pull: {favorites: req.body.advid}}, function (err, upd) {

        res.send("Deleted from favorites");

    })

});

app.post('/deleteadv', function (req, res) {

    Adv.findOne({_id: req.body.advid},function (err,result) {

        fs.unlink("./public/img/advs/"+req.body.imageurl+".png",function (err) {})

    })

    Adv.remove({_id: req.body.advid,owner:req.body.userid}, function (err, upd) {
        User.update({favorites: req.body.advid}, {$pull: {favorites: req.body.advid}}, function (err, upd) {

        })
        Chat.remove({advid: req.body.advid}, function (err, upd) {
            res.send("Deleted")
        })

    })

});

app.post('/getfavorite', function(req,res){
    if (req.body.name != null) {
        User.find({name: req.body.name, active: true}).then(function (adv) {
            Adv.populate(adv, {path: "favorites"}, function (err) {
                User.populate(adv[0].favorites, {path: "owner"}, function (err, result) {
                    if(adv[0].favorites.length!=0){
                        for(var i = 0;i<adv[0].favorites.length;i++){
                            if(!adv[0].favorites[i].owner.active){
                            }
                            else{
                                if(adv[0].favorites[i]._id==req.body.advid)
                                {
                                    res.send("True")
                                }
                            }
                        }
                    }
                    else{
                        res.send("False");
                    }
                });
            });
        });

    }
    else {
        res.send("undefined");
    }
});

app.post('/treatsdone', function(req,res){
    var advs = [];
    var id, title, description, exchange, category, imageurl, location,owner,ownername;
    if (req.body.name != null) {
        Chat.find({buyer: req.body.name, closed: true}).then(function (chats) {
            Adv.populate(chats, {path: "advid"}, function (err) {
                    for (var i = 0; i < chats.length; i++) {
                        id = chats[i].advid._id;
                        title = chats[i].advid.title;
                        description = chats[i].advid.description;
                        exchange = chats[i].advid.exchange;
                        category = chats[i].advid.category;
                        imageurl = chats[i].advid.imageurl;
                        location = chats[i].advid.location;
                        owner = chats[i].user2;
                        ownername= chats[i].sellername;
                        advs.push({
                            id: id,
                            title: title,
                            description: description,
                            exchange: exchange,
                            category: category,
                            owner: owner,
                            ownername: ownername,
                            imageurl: imageurl,
                            location: location
                        });
                    }
                    res.send(advs);
            });
        });

    }
    else {
        res.send("undefined");
    }
});


app.post('/objectsdone', function(req,res){
    var advs = [];
    var id, title, description, exchange, category, imageurl, location,owner,ownername;
    if (req.body.name != null) {
        Chat.find({sellername: req.body.name, closed: true}).then(function (chats) {
            Adv.populate(chats, {path: "advid"}, function (err) {
                for (var i = 0; i < chats.length; i++) {
                    id = chats[i].advid._id;
                    title = chats[i].advid.title;
                    description = chats[i].advid.description;
                    exchange = chats[i].advid.exchange;
                    category = chats[i].advid.category;
                    imageurl = chats[i].advid.imageurl;
                    location = chats[i].advid.location;
                    owner = chats[i].user2;
                    ownername= chats[i].sellername;
                    advs.push({
                        id: id,
                        title: title,
                        description: description,
                        exchange: exchange,
                        category: category,
                        owner: owner,
                        ownername: ownername,
                        imageurl: imageurl,
                        location: location
                    });
                }
                res.send(advs);
            });
        });

    }
    else {
        res.send("undefined");
    }
});



app.post('/userAdvs', function (req, res) { //todos los anuncios
    var advs = [];
    var sellerID=req.body.id
    var id, title, description, exchange, category, imageurl, location,active;
    Adv.find({active:true,owner:(sellerID)},function (err, adv) {
            for (var i = 0; i < adv.length; i++) {
                id = adv[i]._id;
                title = adv[i].title;
                description = adv[i].description;
                exchange = adv[i].exchange;
                category = adv[i].category;
                imageurl = adv[i].imageurl;
                location = adv[i].location;
                    advs.push({
                        id: id,
                        title: title,
                        description: description,
                        exchange: exchange,
                        category: category,
                        owner: sellerID,
                        ownername: req.body.name,
                        imageurl: imageurl,
                        location: location
                    });

            }
            res.send(advs);


    });
});




app.get('/allAdvs', function (req, res) { //todos los anuncios
    var advs = [];
    var id, title, description, exchange, category, imageurl, location;

    Adv.find({active:true},function (err, adv) {
        User.populate(adv, {path: "owner"}, function (err, result) {
            for (var i = 0; i < adv.length; i++) {
                if (!result[i].owner.active){
                }
                else{
                    id = adv[i]._id;
                    title = adv[i].title;
                    description = adv[i].description;
                    exchange = adv[i].exchange;
                    category = adv[i].category;
                    imageurl = adv[i].imageurl;
                    location = adv[i].location;
                    advs.push({
                        id: id,
                        title: title,
                        description: description,
                        exchange: exchange,
                        category: category,
                        owner: result[i].owner._id,
                        ownername:result[i].owner.name,
                        imageurl: imageurl,
                        location:location
                    });
                }
            }

            res.send(advs);
        });

    });
});


app.post('/profile', function (req, res) {
    var advs = [];
    var usr;
    var name;
    var i=0;
    var data;
    var id, title, description, exchange, category, imageurl, userLocation,location,active;
    if (req.body.name != null) {
        User.find({name: req.body.name, active: true}).then(function (adv) {

                Adv.populate(adv, {path: "favorites"}, function (err,result) {
                    userLocation=adv[0].location
                    usr=adv[0]._id;
                    name=adv[0].name;
                    User.populate(adv[0].favorites, {path: "owner"},function (err,result) {
                        for(var i = 0;i<adv[0].favorites.length;i++){
                            if(!adv[0].favorites[i].owner.active){
                            }
                            else{
                                id = adv[0].favorites[i]._id;
                                title = adv[0].favorites[i].title;
                                description = adv[0].favorites[i].description;
                                exchange = adv[0].favorites[i].exchange;
                                category = adv[0].favorites[i].category;
                                imageurl = adv[0].favorites[i].imageurl;
                                location = adv[0].favorites[i].location;
                                active=adv[0].favorites[i].active;
                                if(active) {
                                    advs.push({
                                        id: id,
                                        title: title,
                                        description: description,
                                        exchange: exchange,
                                        category: category,
                                        owner: result[i].owner._id,
                                        ownername: result[i].owner.name,
                                        imageurl: imageurl,
                                        location: location
                                    });
                                }
                            }
                        }
                        data={name:name,userid:usr,location:userLocation,advs:advs,image:adv[0].image};
                        res.send(data);
                    })

                });
        });

    }
    else {
        res.send("undefined");
    }
});

app.get('/filterdb/:letter', function (req, res) {
    var userList = [];
    var letter = req.params.letter;
    User.find({"name": {"$regex": letter}}, function (err, us) {
        for (var i = 0; i < us.length; i++) {
            userList.push({name: us[i].name, password: us[i].password, done: false});
        }
        res.send(userList);
    });
});
app.get('/search/:word', function (req, res) {
    var advList = [];
    var word = req.params.word;
    Adv.find({active:true,$text: {$search: word}}, function (err, adv) {
        //Si no va, añadir a la base de datos un inidce con
        //db.advs.createIndex({ title: "text", description: "text", exchange: "text"})
        if(adv != undefined) {
            User.populate(adv, {path: "owner"}, function (err, result) {
                for (var i = 0; i < adv.length; i++) {
                    advList.push({
                        id: adv[i]._id,
                        title: adv[i].title,
                        description: adv[i].description,
                        exchange: adv[i].exchange,
                        category: adv[i].category,
                        owner: result[i].owner._id,
                        ownername: result[i].owner.name,
                        imageurl: adv[i].imageurl,
                        location: adv[i].location

                    });
                }
                console.log("Buscando: "+word);
                res.send(advList);
            })
        }
        else {
            res.send(advList);
        }

    });
});

app.post('/addAdv', function (req, res) {

    Adv.find({title: req.body.title, owner: req.body.owner}).then(function (response) {
        if (response[0] != undefined) {
            res.send("500");
        } else {
            var a = new Adv({
                title: req.body.title,
                description: req.body.description,
                exchange: req.body.exchange,
                category: req.body.category,
                owner: req.body.owner,
                active:req.body.active,
                imageurl: req.body.owner+"-"+req.body.title,
                location: req.body.location
            });
            a.save().then(function () {
            });
            res.send("200");
        }
    });
});

app.post('/sendOffer', function (req, res) {
    var room=req.body.advid+"-"+req.body.userid;
    var msg={author:req.body.buyer,text:req.body.offer};
    var u=Chat({name:room,
                user1:req.body.userid,
                user2:req.body.sellerid,
                sellername:req.body.sellername,
                chats:msg,advurl:req.body.advurl,
                advname:req.body.advname,
                advid:req.body.advid,
                closed:false,
                buyer:req.body.buyer});
    u.save().then(function () {
        res.send("200")

    })
});
app.post('/rooms',function (req, res) {
    Chat.find({$or: [ { user1: req.body.userid }, { user2: req.body.userid }]}).then(function (response) {
        res.send(response);
    })
});
app.post('/treatdone',function (req, res) {
    User.findOneAndUpdate({name: req.body.buyer}, {$push: {revpending: {name:req.body.seller}}}, function (err, upd) {
        Chat.findOneAndUpdate({name: req.body.chat}, {$set:{closed: req.body.closed}}).then(function (response) {
            Adv.findOneAndUpdate({_id:req.body.advid},{$set:{active:false}}).then(function(response){
                res.send("ok")
            });
        });
    });
});

app.post('/reviewscount',function (req, res) {
    User.find({name:req.body.name},function (err, user) {
        if(user.length>0)
        res.send(user[0].revpending)
    })
});
app.post('/getChat',function (req, res) {
    Chat.findOne({name:req.body.name},function (err, chat) {
        res.send(chat.chats);
    })
});
app.post('/getUserID', function (req, res) {
    User.findOne({name:req.body.name}, function (err, user) {
        if(user){
        res.send(user._id);
        }
    })
});

app.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls', 'error.html'));
});

app.listen(3500, function () {
    console.log('App listening on port 3500!!')
});

