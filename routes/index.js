var express = require('express'),
    bodyParser = require('body-parser'),
    IMGR = require('imgr').IMGR;

var app = express();
var username = "";
var mongoose = require('mongoose');
var fs = require('fs');
var multer = require('multer');
var Hash = require('jshashes');
var cors = require('cors');
var path = require('path');

var Schema = mongoose.Schema;
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/img/profiles');
    },
    filename: function (req, file, callback) {
            callback(null, req.body.id + ".png");

    }
});
var storageadv = multer.diskStorage({

    destination: function (req, file, callback) {
        callback(null, './public/img/advs');
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
var upload = multer({storage: storage}).single('file');
var uploadadv = multer({storage: storageadv}).single('file');

var imgr = new IMGR({debug:true});

imgr.serve(path.resolve(__dirname,'../public/img/advs'))
    .namespace('/images')
    .urlRewrite('/:path/:size/:file.:ext')
    .whitelist([ '200x300', '100x100','150x'])
    .using(app);



app.get('/', function (req, res) {
    res.sendFile(__dirname + "/adv.html");
});

app.post('/upload', function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return res.send("Error uploading file.");
        }
        else{
            if(req.body.file != undefined){
                var base64Data = req.body.file;
                console.log('writing file...', base64Data);
                fs.writeFile("./public/img/profiles/"+req.body.id+".png", base64Data, 'base64', function(err) {
                    if (err) console.log(err);
                    fs.readFile("./public/img/profiles/"+req.body.id+".png", function(err, data) {
                        if (err) throw err;
                        console.log('reading file...', data.toString('base64'));
                    });
                });
            }
            User.findOneAndUpdate({name: username}, {image: true}).then(function () {
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
        res.send("File is uploaded");
    });
});
/*app.put('/updsub', function (req, res) {
 User.find({name: req.body.name}, function (err, usuario) {
 u = usuario;
 console.log(req.body.subject);
 Adv.update({name: req.body.subject}, {$push: {users: u[0]._id}}, function (err, subj) {
 console.log(subj);
 });
 });
 });*/
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
        res.send(response[0]);
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
        console.log(response);
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
                res.send("200");
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
    if (req.body.name != null) {
        User.find({name: req.body.name, active: true}).then(function (adv) {
                Adv.populate(adv, {path: "favorites"}, function (err,result) {
                    usr=adv[0]._id;
                    name=adv[0].name;
                    advs.push(adv[0].favorites);
                    User.populate(advs, {path: "owner"},function (err,result) {
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
        User.populate(adv, {path: "owner"}, function (err, result) {
            for (var i = 0; i < adv.length; i++) {
                advList.push({
                    id: adv[i]._id,
                    title: adv[i].title,
                    description: adv[i].description,
                    exchange: adv[i].exchange,
                    category: adv[i].category,
                    owner: result[i].owner._id,
                    ownername:result[i].owner.name
                });
            }
            res.send(advList);
        })

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
                imageurl: req.body.owner+"-"+req.body.title
            });
            a.save().then(function () {
            });
            res.sendStatus(200);
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

