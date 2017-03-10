/**
 * Home.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        default:""
    },
    gender: {
        type: String,
        default:""

    },
    // gender: {
    //     type: String,
    //     enum: ['Female', 'Male']
    //
    // },
    mobile: {
        type: Number,
        required: true
    },
    alternateMobile: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        default: " "
    },
    city: {
        type: String,
        default: ""

    },
    country: {
        type: String,
        default: ""

    },
    subject: {
        type: String,
        enum: ['appointment', 'feedback', 'complaint']
    },
    message: {
        type: String,
        default: ""
    },
    timestamp: {
        type: Date,
        default: Date.now()
    }
});
module.exports = mongoose.model('ContactUs', schema);
var models = {

    saveData: function(data, callback) {
        var ContactUs = this(data);
        ContactUs.timestamp = new Date();
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
            // this.findOne({
            //     email: data.email
            // }).exec(function(err, found) {
            //   console.log("found data",found);
            //     if (err) {
            //         console.log(err);
            //         callback(err, null)
            //     } else {
                  if(_.isEmpty(data)){
                    callback("No Data found",null);
                  } else {
                    ContactUs.save(function(err, created) {
                        if (err) {
                            callback(err, null);
                        } else {
                          if(_.isEmpty(created)){
                            callback("There was an error while saving ContactUs data!",null);
                          }
                          else {
                            callback(null,created);
                          }
                        }
                    });
                  }

            //     }
            // });

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
                    ContactUs.find({
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
