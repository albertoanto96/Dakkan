var express = require('express'),
    bodyParser = require('body-parser');
var app = express();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var advs = mongoose.Schema({
    id:Schema.ObjectId,
    title: String,
    description: String,
    exchange: String,
    category: String,
    owner: [{type: Schema.ObjectId , ref:'users'}]
});
var users = mongoose.Schema({
    name: String,
    password: String,
    advs: [{type: Schema.ObjectId ,ref:'advs'}]
});
mongoose.connect("mongodb://localhost:27017/dakkan", function(err) {
    if(!err) {
        console.log("We are connected")
    }
});
var User = mongoose.model('users', users);
var Adv = mongoose.model('advs', advs);
var u;
app.use(express.static('public'));
app.use(bodyParser.json());


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

    User.find({name:req.body.name}).then(function(response){
        if(response[0]!=undefined){
            res.sendStatus(500);
        }
        else{
            u=new User({name:req.body.name,password:req.body.password});
            u.save().then(function(){});
            res.sendStatus(200);
        }
    });

});
/*app.post('/userssubj', function (req, res) {
    var subjList=[];
    var name=req.body.name;
    Adv.find({name: name},function(err, subject){
        User.populate(subject,{path:"users"},function (err, result) {
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
        User.find({name:req.body.name,password:req.body.password}).then(function(response){
            res.send(response[0]);
        });
});
app.put('/updatePass', function (req, res) {
    User.findOneAndUpdate({name:req.body.name},{password:req.body.new}).then(function (response) {
            res.sendStatus(200);
        });
});

app.put('/updateName', function (req, res) {
    User.find({name:req.body.new}).then(function (response) {


        if(response[0]==undefined){
            User.findOneAndUpdate({name:req.body.name},{name:req.body.new}).then(function (response) {
                res.sendStatus(200);
            });
        }
        else
        {
            res.send("500");
        }
    })

});


app.delete('/delete', function (req, res) {
        User.findOneAndRemove({name:req.body.name,password:req.body.password}, function (err, response) {
            if(response!=null){
                res.sendStatus(200);

            }
            else {
                res.sendStatus(500);

            }
             });
});
app.get('/all', function (req,res) {
    var users = [];
    User.find(function(err, usuarios){
        for (var i = 0; i < usuarios.length; i++) {
            users.push({name: usuarios[i].name, password: usuarios[i].password, done:false});
        }
        res.send(users);
    });
});
app.get('/allAdvs', function (req,res) { //todos los anuncios
    var advs = [];
    Adv.find(function(err, adv){
        for (var i = 0; i < adv.length; i++) {
            advs.push({id:adv[i]._id,title:adv[i].title,description:adv[i].description,exchange:adv[i].exchange,category:adv[i].category});
        }
        res.send(advs);
    });
});
app.get('/filterdb/:letter', function (req, res) {
    var userList=[];
    var letter=req.params.letter;
    User.find({"name":{"$regex": letter} },function (err, us) {
        for (var i = 0; i < us.length; i++) {
            userList.push({name: us[i].name, password: us[i].password, done:false});
        }
        res.send(userList);
    });
});

app.listen(3500, function () {
    console.log('App listening on port 3500!!')
});

