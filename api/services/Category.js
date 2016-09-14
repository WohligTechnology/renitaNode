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
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    image1: {
        type: String,
        default: ""
    },
    color: {
        type: String,
        default: false
    },
    description: {
        type: String,
        default: ""
    },
    order: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum:["true","false"]
    },
    timestamp: {
        type: Date,
        default: Date.now()
    },
    colours: {
        type: String,
        default: ""
    },
    anchor: {
        type: String,
        default: ""
    }
});
module.exports = mongoose.model('Category', schema);
var models = {
    sort: function(data, callback) {
        function callSave(num) {
            Category.saveData({
                _id: data[num],
                order: num + 1
            }, function(err, respo) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    num++;
                    if (num == data.length) {
                        callback(null, {
                            comment: "Data sorted"
                        });
                    } else {
                        callSave(num);
                    }
                }
            });
        }
        if (data && data.length > 0) {
            callSave(0);
        } else {
            callback(null, {});
        }
    },
    saveData: function(data, callback) {
        var Category = this(data);
        Category.timestamp = new Date();
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
            Category.save(function(err, created) {
                if (err) {
                    callback(err, null);
                } else if (created) {
                    callback(null, created);
                } else {
                    callback(null, {});
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
    getAllCat: function(data, callback) {
        this.find({}).sort({
            order: 1
        }).select("name order").exec(function(err, found) {
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

    getAllCategory: function(data, callback) {
        Category.aggregate([{
            $lookup: {
                from: "subcategories",
                localField: "_id",
                foreignField: "category",
                as: "subnav"
            }
        }, {
            $project: {
                _id: 1,
                name: 1,
                colours: 1,
                anchor: 1,
                subnav: 1
            }
        }]).exec(function(err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else if (found.length > 0) {
                callback(null, found);
            } else {
                callback([], null);
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
                    Category.count({
                        name: {
                            "$regex": check
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
                    Category.find({
                        name: {
                            "$regex": check
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
