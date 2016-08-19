/**
 * Home.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    email: {
        type: String,
        default: " "
    },
    timestamp: {
        type: Date,
        default: Date.now()
    }
});
module.exports = mongoose.model('Subscribe', schema);
var models = {

    saveData: function(data, callback) {
        var Subscribe = this(data);
        Subscribe.timestamp = new Date();
        if (data._id) {
            this.findOneAndUpdate({
                _id: data._id
            }, data, {
                new: true
            }).exec(function(err, updated) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else if (updated) {
                    callback(null, updated);
                } else {
                    callback(null, {});
                }
            });
        } else {
            this.findOne({
                email: data.email
            }).exec(function(err, found) {
                if (err) {
                    console.log(err);
                    callback(err, null)
                } else {
                    if (found) {
                      // console.log("email Exists");
                        callback(null, "Email alredy Exists");
                    } else {
                      // console.log("save");
                        Subscribe.save(function(err, created) {
                            if (err) {
                                callback(err, null);
                            } else if (created) {
                                var emailData = {};
                                emailData.email = data.email;
                                console.log('data.email', data.email);
                                // emailData.content = ;
                                emailData.filename = "subscribe.ejs";
                                emailData.subject = "Thnk You For Subscribe";
                                Config.email(emailData, function(err, emailRespo) {
                                    if (err) {
                                        console.log(err);
                                        callback(err, null);
                                    } else {
                                        console.log(emailRespo);
                                        // callback(null, {
                                        //     comment: "Mail Sent"
                                        // });
                                        callback(null, created);
                                    }
                                });

                            } else {
                                callback(null, {});
                            }
                        });
                    }
                }
            });

        }
    },
    deleteData: function(data, callback) {
        this.findOneAndRemove({
            _id: data._id
        }, function(err, deleted) {
            if (err) {
                callback(err, null);
            } else if (deleted) {
                callback(null, deleted);
            } else {
                callback(null, {});
            }
        });
    },
    getAll: function(data, callback) {
        this.find({}).exec(function(err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else if (found && found.length > 0) {
                callback(null, found);
            } else {
                callback(null, []);
            }
        });
    },

    getOne: function(data, callback) {
        this.findOne({
            "_id": data._id
        }).exec(function(err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else if (found && Object.keys(found).length > 0) {
                callback(null, found);
            } else {
                callback(null, {});
            }
        });
    },
    findLimited: function(data, callback) {
        var newreturns = {};
        newreturns.data = [];
        var check = new RegExp(data.search, "i");
        data.pagenumber = parseInt(data.pagenumber);
        data.pagesize = parseInt(data.pagesize);
        async.parallel([
                function(callback) {
                    Subscribe.count({
                        email: {
                            '$regex': check
                        }
                    }).exec(function(err, number) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else if (number && number !== "") {
                            newreturns.total = number;
                            newreturns.totalpages = Math.ceil(number / data.pagesize);
                            callback(null, newreturns);
                        } else {
                            callback(null, newreturns);
                        }
                    });
                },
                function(callback) {
                    Subscribe.find({
                        email: {
                            '$regex': check
                        }
                    }).skip(data.pagesize * (data.pagenumber - 1)).limit(data.pagesize).sort({
                        order: 1
                    }).exec(function(err, data2) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else if (data2 && data2.length > 0) {
                            newreturns.data = data2;
                            callback(null, newreturns);
                        } else {
                            callback(null, newreturns);
                        }
                    });
                }
            ],
            function(err, data4) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else if (data4) {
                    callback(null, newreturns);
                } else {
                    callback(null, newreturns);
                }
            });
    },
};
module.exports = _.assign(module.exports, models);
