var express = require('express'),
    bodyParser = require('body-parser'),
    IMGR = require('imgr').IMGR;
var app = express();
var username = "";
var passport= require('passport')
var mongoose = require('mongoose');
var fs = require('fs');
var multer = require('multer');
var Hash = require('jshashes');
var cors = require('cors');
var session = require('express-session')
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



var advs = mongoose.Schema({
    id: Schema.ObjectId,
    title: String,
    description: String,
    exchange: String,
    category: String,
    owner: {type: Schema.ObjectId, ref: 'users'},
    imageurl: String
});
var users = mongoose.Schema({
    name: String,
    password: String,
    favorites: [{type: Schema.ObjectId, ref: 'advs'}],
    image: Boolean,
    active: Boolean,
    offers: [{type: Schema.ObjectId, ref: 'offers'}]
});
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

mongoose.connect("mongodb://localhost:27017/dakkan", function (err) {
    if (!err) {
        console.log("We are connected")
    }
});
var User = mongoose.model('users', users);
var Adv = mongoose.model('advs', advs);
var Offer = mongoose.model('offers', offers);
var u;
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());
app.use(function (req, res, next) {
res.header("Access-Control-Allow-Origin", "*");
res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
next();
});
var upload = multer({storage: storage}).single('file');
var uploadadv = multer({storage: storageadv}).single('file');

var imgr = new IMGR({debug:true});

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

app.get('/', function (req, res,next) {
    res.render('index', {title: 'OAuth example: facebook'});
    res.sendFile(__dirname + "/adv.html");
});
app.get('/FProfile',isAuth,function (req,res,next) {
    res.render('profile', {title:'Your profile page', user: req.user});
})
app.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/');
});
app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['public_profile', 'email'] }));
//handle the callback after facebook has authenticated the user
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/'
}));
function isAuth(req, res, next) {
    if (req.isAuthenticated())
        return next();
// otherwise, send her back to home
    res.redirect('/');
}
module.exports=app;

app.post('/upload', function (req, res){
    upload(req, res, function (err) {
        if (err) {
	 console.log("ERROR Subiendo foto perfil");
	return res.send("Error uploading file.");
        }
        else{
            if(req.body.file != undefined){
                var base64Data = req.body.file;
                console.log('writing file...', base64Data);
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
                        console.log('reading file...', data.toString('base64'));
                    });
                });
            }
            User.findOneAndUpdate({name: username}, {$set:{image: true}}).then(function (response) {
		console.log(response[0]);
            });
	res.send("File is uploaded");
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
                console.log('writing file...', base64Data);
                fs.writeFile("./public/img/advs/"+req.body.name+".png", base64Data, 'base64', function(err) {
                    if (err) console.log(err);
                    fs.readFile("./public/img/advs/"+req.body.name+".png", function(err, data) {
                        if (err) throw err;
                        console.log('reading file...', data.toString('base64'));
                    });
                });
            }
            res.send("File is uploaded");
        }
    });
});
app.post('/push', function (req, res) {
    User.find({name: req.body.name}).then(function (response) {
        if (response[0] !== undefined) {
            if (response[0].active !== true) {
                User.findOneAndUpdate({name: req.body.name}, {active: true}).then(function (response) {
                    res.send(response);
                });
            }
            else {
                res.sendStatus(500);
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
/*app.post('/userssubj', function (req, res) {
 var subjList=[];
 var name=req.body.name;
 Adv.find({name: name},function(err, subject){
 User.populate(subject,{path :"users"},function (err, result) {
 for (var i = 0; i < result[0].users.length; i++) {
 subjList.push({name: result[0].users[i].name, password: result[0].users[i].password});
 }
 subjList.sort(function (a,b){
 var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase();
 if (nameA < nameB) //sort string ascending
 return -1;
 if (nameA > nameB)
 return 1;
 return 0 ;//default return value (no sorting)
 });
 res.send(subjList);
 });
 });
 });*/
app.post('/login', function (req, res) {
    var pass = req.body.password;
    var passhash = new Hash.SHA256(pass).hex(pass);
    User.find({name: req.body.name, password: passhash, active: true}).then(function (response) {
        username = req.body.name;
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
     res.send(usuarios[0].image);

    });
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

app.post('/getfavorite', function(req,res){
    var advs = [];
    var id, title, description, exchange, category, imageurl;
    if (req.body.name != null) {
        User.find({name: req.body.name, active: true}).then(function (adv) {
            Adv.populate(adv, {path: "favorites"}, function (err,result) {
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
                            advs.push({
                                id: id,
                                title: title,
                                description: description,
                                exchange: exchange,
                                category: category,
                                owner: result[i].owner._id,
                                ownername: result[i].owner.name,
                                imageurl: imageurl
                            });


                        }
                    }
                    res.send(advs);
                })

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
    var id, title, description, exchange, category, imageurl;
    Adv.find({owner:(sellerID)},function (err, adv) {
            for (var i = 0; i < adv.length; i++) {
                id = adv[i]._id;
                title = adv[i].title;
                description = adv[i].description;
                exchange = adv[i].exchange;
                category = adv[i].category;
                imageurl = adv[i].imageurl;
                advs.push({
                    id: id,
                    title: title,
                    description: description,
                    exchange: exchange,
                    category: category,
                    owner: sellerID,
                    ownername:req.body.name,
                    imageurl: imageurl
                });
            }
            res.send(advs);


    });
});




app.get('/allAdvs', function (req, res) { //todos los anuncios
    var advs = [];

    var id, title, description, exchange, category, imageurl;
    Adv.find(function (err, adv) {
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
                    advs.push({
                        id: id,
                        title: title,
                        description: description,
                        exchange: exchange,
                        category: category,
                        owner: result[i].owner._id,
                        ownername:result[i].owner.name,
                        imageurl: imageurl
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
    var id, title, description, exchange, category, imageurl;
    if (req.body.name != null) {
        User.find({name: req.body.name, active: true}).then(function (adv) {
                Adv.populate(adv, {path: "favorites"}, function (err,result) {
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
                                advs.push({
                                    id: id,
                                    title: title,
                                    description: description,
                                    exchange: exchange,
                                    category: category,
                                    owner: result[i].owner._id,
                                    ownername: result[i].owner.name,
                                    imageurl: imageurl
                                });


                            }
                        }
                        data={name:name,userid:usr,advs:advs,image:adv[0].image};
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
    Adv.find({$text: {$search: word}}, function (err, adv) {
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
                        ownername: result[i].owner.name
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
            console.log("Sin subir anuncio")
            res.send("500");
        } else {
            var a = new Adv({
                title: req.body.title,
                description: req.body.description,
                exchange: req.body.exchange,
                category: req.body.category,
                owner: req.body.owner,
                imageurl: req.body.owner+"-"+req.body.title
            });
            a.save().then(function () {
            });
            console.log("Subiendo anuncio")
            res.send("200");
        }
    });
});

app.post('/sendOffer', function (req, res) {

    Offer.find({idInterested: req.body.userid, idAdv: req.body.advid}).then(function (response) {
        if (response[0] != undefined) {
            res.send("500");
        } else {
            var a = new Offer({
                idAdv: req.body.advid,
                state: "Abierto",
                idInterested: req.body.userid,
                chat: [
                    {
                        owner: false,
                        message: req.body.offer
                    }
                ]
            });
            a.save().then(function () {
            });
            res.sendStatus(200);
        }
    });
});

app.listen(3500, function () {
    console.log('App listening on port 3500!!')
});

