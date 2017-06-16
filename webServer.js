"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
var async = require('async');


// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var express = require('express');
var app = express();

// XXX - Your submission should work without this line
var cs142models = require('./modelData/photoApp.js').cs142models;

mongoose.connect('mongodb://localhost/cs142project6');

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.count({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {

    User.find({}, function (err, users) {
        if (err) {
            // Query returned an error.  We pass it back to the browser with an Internal Service
            // Error (500) error code.
            console.error('Doing /user/list error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        console.log('userList', users);
        response.end(JSON.stringify(users));


    });

    //response.status(200).send(cs142models.userListModel());
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {

    /*
    var id = request.params.id;
    var user = cs142models.userModel(id);
    if (user === null) {
        console.log('User with _id:' + id + ' not found.');
        response.status(400).send('Not found');
        return;
    }
    response.status(200).send(user);
*/
    console.log(request.params.id);
    User.findOne({_id: request.params.id}, function (err, user) {
        if(err) {
            console.error('Doing /user/:id error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (user === null) {
            //console.log('User with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        response.end(JSON.stringify(user));
        console.log('user', user);
    });

});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    var photo;
    var obj = [];
    obj = JSON.parse(JSON.stringify(obj));

    var addObj = function(err) {
        //console.log("WHATTTTT");
       //console.log('STRINGIFY', obj[0].comments[0].user[0]);
       obj = JSON.parse(JSON.stringify(obj));
       response.end(JSON.stringify(obj));
   };
   var examineComments = function(eachComment, doneCallback){
       var commentID = eachComment.user_id;
       User.find({_id:commentID}, function (err, user) {
           if (err) {
               // Query returned an error.  We pass it back to the browser with an Internal Service
               // Error (500) error code.
               console.error('Doing /user/list error:', err);
               response.status(400).send(JSON.stringify(err));
               //doneCallback();
               return;
           }
           user = JSON.parse(JSON.stringify(user));
           console.log('EACHCOMMENTBEFORE', eachComment);
           eachComment.user = user[0];
           console.log('eachCommentAfter',eachComment);
           doneCallback();
           //return;
           //async.each(users, addParam, iterateDone);
       });
       //doneCallback();

   };


    var examinePhoto = function (eachPhoto, callback) {
        var addPhoto = function() {
            obj.push(eachPhoto);
            //console.log('EACHPHOTO.COMMENTS',eachPhoto.comments);
            callback();
        };
        eachPhoto = JSON.parse(JSON.stringify(eachPhoto));

        //console.log(eachPhoto);
        var id = request.params.id;
        //console.log(eachPhoto.user_id, id);
        //console.log('requestid',id);
        if(eachPhoto.user_id === id) {
            //console.log('LENGTH',eachPhoto.comments.length);
            //photo = eachPhoto;
                           //potential problem
            console.log('eachPhoto.comments.length', eachPhoto.comments.length);
            console.log('eachPhoto.isMostRecent',eachPhoto.isMostRecent);
            //eachPhoto.isMostRecent = false;
            if(eachPhoto.comments.length === 0) {
                addPhoto();
                //callback();
                return;
            }
            async.each(eachPhoto.comments, examineComments, addPhoto);
        } else {
            callback();
        }
        //callback();
    };

    Photo.find({}, function(err,photos) {

        if (err) {
            // Query returned an error.  We pass it back to the browser with an Internal Service
            // Error (500) error code.
            console.error('Doing /photosOfUser:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        photos = JSON.parse(JSON.stringify(photos));
        async.each(photos, examinePhoto, addObj);
    });

});



var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});

var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');

app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

app.post('/admin/login', function(request, response) {
    bodyParser.json(request.body);
    var username = request.body.login_name;
    var password = request.body.password;
    session.login_name = username;
    User.findOne({login_name: username}, function (err, user) {
        if(err) {
            console.error('Doing /user/:id error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        } else {
            if(user === null || user.password !== password) {
                response.status(400).send('Not found');
                return;
            } else {

                console.log('USER', user);
                //
                request.session.login_name = username;
                console.log(request.session.login_name);
                response.end(JSON.stringify(user));
            }
        }
    });
    //response.status(400).send('Bad param ');
    //console.log(request);
});

app.post('/admin/logout', function(request, response) {
    User.findOne({login_name: session.login_name}, function (err, user) {
        if(err) {
            console.error('Doing /user/:id error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        } else {
            if(user === null) {
                response.status(400).send('Not found');
                return;
            } else {
                request.session.destroy(function (err){});
                response.end(JSON.stringify(user));
            }
        }
    });

});



app.post('/commentsOfPhoto/:photo_id', function(request, response) {
    var currUser;
    var photo_id=request.params.photo_id;

    User.findOne({login_name: session.login_name}, function (err, user) {
        if(err) {
            console.error('Doing /user/:id error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        } else {
            if(user === null) {
                response.status(400).send('Not found');
                return;
            } else {
                currUser = user;
            }
        }

        Photo.findOne({_id:photo_id}, function(err, photo) {
            //photo = JSON.parse(JSON.stringify(photo));
            console.log('PHOTO',photo.comments);
            console.log('USER', user);
            bodyParser.json(request.body);
            //response.end(JSON.stringify(user));
            var newComment = {};
            newComment.comment = request.body.comment;
            newComment.user_id = user._id;
            newComment.date_time = new Date();
            photo.comments.push(newComment);
            console.log('NEwPhoto',photo);
            console.log(currUser);
            photo.save();
        });
    });


    response.end();
});

var fs = require("fs");
var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');

app.get('/photoMostComments/:file_name', function(request,response) {
    bodyParser.json(request.params.file_name);
    console.log("mostComments3", request.params.file_name);
    Photo.findOne({file_name: request.params.file_name}, function(err, photo) {
        var comments = photo.comments;
        if(comments.length === 0) {
            response.status(400).send('Not found');
            return;
        }
        var bestUserId;
        var mostComments = 0;
        var nComments = 0;
        for(var i = 0; i < comments.length; i++){
            var userId = comments[i].user_id;

            for(var j = i; j < comments.length; j++) {
                console.log('userId', userId);
                console.log(comments[j].user_id);
                if(userId === comments[j].user_id){
                    nComments++;
                    console.log('count',nComments);
                }
            }
            if(nComments > mostComments) {
                console.log('nComments', nComments);
                console.log('mostComments', mostComments);
                mostComments = nComments;
                bestUserId = userId;
            }

        }

        Photo.findOne({user_id:bestUserId}, function(err, photo) {
            photo.login_name = session.login_name;
            var obj = {photo, mostComments};
            console.log('object5',obj);
            response.end(JSON.stringify(obj));
        });


    });


});

app.get('/mostRecent/:userId', function(request,response) {
    Photo.findOne({isMostRecent:true, user_id: request.params.userId}, function(err, photo) {
        console.log('request.params.userId',request.params.userId);
        if(err) {
            console.error('Doing /user/:id error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        } else {
            if(photo === null) {
                response.status(400).send('Not found');
                return;
            }
        }
        console.log('MOSTRECENT', photo);
        photo.save();
        response.end(JSON.stringify(photo));
    });
});

app.post('/photos/new', function(request, response) {
    var currUser;
    //console.log(request);
    console.log('POST');
    processFormBody(request, response, function (err) {
        if (err || !request.file) {
            // XXX -  Insert error handling code here.
            return;
        }
        // request.file has the following properties of interest
        //      fieldname      - Should be 'uploadedphoto' since that is what we sent
        //      originalname:  - The name of the file the user uploaded
        //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
        //      buffer:        - A node Buffer containing the contents of the file
        //      size:          - The size of the file in bytes

        // XXX - Do some validation here.
        // We need to create the file in the directory "images" under an unique name. We make
        // the original file name unique by adding a unique prefix with a timestamp.
        var timestamp = new Date().valueOf();
        var filename = 'U' +  String(timestamp) + request.file.originalname;

        fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
          // XXX - Once you have the file written into your images directory under the name
          // filename you can create the Photo object in the database
        });

        var newPhoto = {};
        User.findOne({login_name: session.login_name}, function (err, user) {
            if(err) {
                console.error('Doing /user/:id error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            } else {
                if(user === null) {
                    response.status(400).send('Not found');
                    return;
                } else {
                    currUser = user;
                    user.photoFile_name = "images/" + filename;
                    console.log('user.photoFile_name', user.photoFile_name);
                    user.save();
                }
            }

            Photo.find({}, function(err,photos) {
                var doneCallback = function() {

                };

                if (err) {
                    // Query returned an error.  We pass it back to the browser with an Internal Service
                    // Error (500) error code.
                    console.error('Doing /photosOfUser:', err);
                    response.status(500).send(JSON.stringify(err));
                    return;
                }
                Photo.findOne({login_name: session.login_name, isMostRecent: true}, function(err,photo) {
                    if(photo !== null) {
                        console.log('changedToFalse', photo);
                        photo.isMostRecent = false;
                        photo.save();
                    }
                    console.log('newAddedPhoto',photo);
                    Photo.create({file_name: filename, date_time:new Date(), user_id :user._id, login_name: session.login_name,  comments: [], isMostRecent: true}, doneCallback);
                    /*
                    newPhoto.file_name = filename;
                    newPhoto.date_time = new Date();
                    newPhoto.user_id = user._id;
                    newPhoto.comments = [];
                    photos.push(newPhoto);
                    */

                    console.log('PHOTOS',photos);
                    response.end();
                });
            });

        });


    });


});

app.post('/user', function(request, response) {

    bodyParser.json(request.body);
    var login_name = request.body.login_name;
    var first_name = request.body.first_name;
    var last_name = request.body.last_name;
    var location = request.body.location;
    var description = request.body.description;
    var password = request.body.password;
    User.findOne({login_name: request.body.login_name}, function (err, user) {

        if(err) {
            console.error('Doing /user/:id error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        } else {
            if(user !== null) {
                console.log('taken');
                response.status(400).send('User already taken');
                //response.end('user already taken');
                return;
            }
        }
        User.create({first_name: request.body.first_name, last_name: request.body.last_name, login_name:request.body.login_name,
            location: request.body.location, description: request.body.description, password: request.body.password});
            response.end();
            User.find({}, function(err,users) {

                console.log(users);
            });
    });




});

app.post('/updateActivity/', function(request, response){
    console.log('started update');
    bodyParser.json(request.body);
    var id = request.body.userId;
    var update = request.body.update;
    console.log('USERID',id);
    User.findOne({_id: id}, function(err, user) {
        console.log('started searching Users', user);
        if(err) {
            console.error('Doing /mentions/ error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if(user === undefined || user === null) {
            response.status(400).send('user is undefined');
            return;
        }
        user.recentActivity = update;
        if(update === "posted a photo") {
            user.updateIsPhoto = true;
        } else {
            user.updateIsPhoto = false;
        }

        user.save();
        console.log('user.recentActivity',user.recentActivity);
        response.end();
    });
});

app.get('/getActivity/:userId', function(request, response) {
    console.log('get Id');
    var id = request.params.userId;
    console.log('param id', id);
    User.findOne({_id: id}, function(err, user) {
        console.log('started searching Users', user);
        if(err) {
            console.error('Doing /mentions/ error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if(user === undefined) {
            response.status(400).send('user is undefined');
            return;
        }
        response.end(user.recentActivity);
    });

});


app.post('/mentions/new', function(request, response) {
    console.log('newMention');
    bodyParser.json(request.body);
    var file_name = request.body.file_name;
    var id = request.body._id;
    console.log('mentions new ID',id);
    User.findOne({_id: id}, function(err, user) {
        if(err) {
            console.error('Doing /mentions/ error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if(user === undefined) {
            response.status(400).send('user is undefined');
            return;
        }
        console.log('mention user', user);
        Photo.findOne({file_name: request.body.file_name}, function(err, photo) {
            console.log('photo find one', photo);
            //photo=JSON.parse(JSON.stringify(photo));
            photo.userMentions.push(id);
            photo.login_name = user.login_name;
            console.log('photo addedTo', photo);
            photo.save();
            response.end();
        });
    });

});

app.get('/mentions/:userId', function(request, response) {
    console.log('START MENTION');
    bodyParser.json(request.body);
    var userId = request.params.userId;
    var photosOfUser = [];
    //var login_name = session.login_name;
    console.log('userIds',userId);
    Photo.find({}, function(err, photos) {
        if(err) {
            console.error('Doing /user/:id error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        console.log('Started Loop');
        console.log('LENGTH', photos.length);
        for(var i = 0; i < photos.length; i++) {
            var eachPhoto = photos[i];
            console.log('eachPhoto', eachPhoto);
            var eachMention = eachPhoto.userMentions;
            for(var j = 0; j < eachMention.length; j++) {
                console.log('COMPARE', userId);
                console.log('eachMention', eachMention[j]);

                if(userId === eachMention[j]) {
                    console.log('added Photot', photos[i]);
                    photosOfUser.push(photos[i]);
                    break;
                }
            }
        }
        if(photosOfUser.length === 0) {
            response.status(400).send('No Mentions');
            return;
        }
        console.log('photosOfUSer',photosOfUser);
        response.end(JSON.stringify(photosOfUser));
    });
});
