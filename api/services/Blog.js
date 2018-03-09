/**
 * Home.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
// Mongoose Globals
var mongoose = require('mongoose');
// global["deepPopulate"] = require('mongoose-deep-populate')(mongoose);
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var schema = new Schema({
    name: {
        type: String,
        default: " "
    },

    image: {
        type: String,
        default: ""
    },
    // bannerimage: {
    //     type: String,
    //     default: ""
    // },
    // bannerimage1: {
    //     type: String,
    //     default: ""
    // },
    date: {
        type: Date,
        default: Date.now()
    },
    tags: [{
        type: Schema.Types.ObjectId,
        ref: 'Tags',
        index: true
    }],
    description: {
        type: String,
        default: ""

    },
    views: {
        type: Number,
        default: 0
    },
    order: {
        type: Number,
        default: 0
    },
    status: {
        type: Boolean
    },
    timestamp: {

        type: Date,
        default: Date.now()
    },
    video: {
        type: String
    }
});
module.exports = mongoose.model('Blog', schema);
// schema.plugin(deepPopulate, {
//     populate: {
//         'tags': {
//             select: "_id name"
//         }
//     }
// });
var models = {
    saveData: function (data, callback) {
        var Blog = this(data);
        Blog.timestamp = new Date();
        if (data._id) {
            this.findOneAndUpdate({
                _id: data._id
            }, data, {
                new: true
            }).exec(function (err, updated) {
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
            Blog.save(function (err, created) {
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
    deleteData: function (data, callback) {
        this.findOneAndRemove({
            _id: data._id
        }, function (err, deleted) {
            if (err) {
                callback(err, null);
            } else if (deleted) {
                callback(null, deleted);
            } else {
                callback(null, {});
            }
        });
    },
    getAll: function (data, callback) {
        this.find({
            status: "true"
        }).sort({
            order: -1
        }).exec(function (err, found) {
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

    getOne: function (data, callback) {
        this.findOne({
            "_id": data._id
        }).exec(function (err, found) {
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
    getOneBlog: function (data, callback) {
        var newreturns = {};
        newreturns.blog = [];
        newreturns.related = [];
        this.findOne({
            "_id": data._id
        }).populate("tags", "name").exec(function (err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                newreturns.blog = found;
                if (found && found.tags) {
                    Blog.find({
                        tags: {
                            $in: found.tags
                        },
                        _id: {
                            $nin: found._id
                        }
                    }).limit(3).exec(function (err, data2) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            newreturns.related = data2;
                            callback(null, newreturns);
                        }
                    });
                } else {
                    callback(null, newreturns);
                }
            }
        });
    },

    getPopularPosts: function (data, callback) {
        Blog.find({}).sort({
            views: -1
        }).limit(6).select("name date views image").exec(function (err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, found);
            }
        });

    },

    getPostTags: function (data, callback) {
        var newreturns = {};
        newreturns.popularposts = [];
        newreturns.tags = [];
        async.parallel([
                function (callback) {
                    Blog.find({}).sort({
                        views: -1
                    }).limit(6).select("name date views image").exec(function (err, found) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            newreturns.popularposts = found;
                            callback(null, newreturns);
                        }
                    });
                },
                function (callback) {
                    Tags.find({}).sort({
                        order: 1
                    }).select("name").exec(function (err, tags) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            newreturns.tags = tags;
                            callback(null, newreturns);
                        }
                    });
                }
            ],
            function (err, data4) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else if (data4) {
                    callback(null, newreturns);
                } else {
                    callback(null, newreturns);
                }
            })
    },

    //wroking code for ---- currently not in use
    findLimited: function (data, callback) {
        var newreturns = {};
        newreturns.data = [];
        var check = new RegExp(data.search, "i");
        data.pagenumber = parseInt(data.pagenumber);
        data.pagesize = parseInt(data.pagesize);
        async.parallel([
                function (callback) {
                    Blog.count({
                        name: {
                            '$regex': check
                        }
                    }).exec(function (err, number) {
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
                function (callback) {
                    Blog.find({
                        name: {
                            '$regex': check
                        }
                    }).populate("tags", "_id name").skip(data.pagesize * (data.pagenumber - 1)).limit(data.pagesize).sort({
                        date: -1
                    }).exec(function (err, data2) {
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
            function (err, data4) {
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



    //To get blogs by tags ---- currently in use
    getBlogByTags: function (data, callback) {
        // console.log("ObjectId(data.tagId)", mongoose.Types.ObjectId(data.tagId));
        var queryString = {};
        var newreturns = {};
        var countObj = {};
        newreturns.data = [];
        data.pagenumber = parseInt(data.pagenumber);
        data.pagesize = parseInt(data.pagesize);
        var tagIdArray = [];
        _.each(data.tagId, function (n) {
            tagIdArray.push(mongoose.Types.ObjectId(n));
        });

        if (data.search == "" || data.search == undefined) {
            if (data.tagId.length > 0) {
                queryString = {
                    "tags": {
                        $in: tagIdArray
                    },
                };
            }
            queryString.status = true
        } else if (data.search != "") {
            var trimText = data.search.trim();
            var splitText = [];
            splitText = trimText.split(' ');
            var search = new RegExp('^' + trimText);
            if (data.tagId.length > 0) {
                queryString.$and = [{
                    "tags": {
                        $in: tagIdArray
                    },
                }, {
                    "name": {
                        $regex: search,
                        $options: "i"
                    }
                }];
            } else {
                queryString = {
                    "name": {
                        $regex: search,
                        $options: "i"
                    }
                }
            }
            queryString.status = true;
            // console.log("queryString", queryString);
        }

        async.parallel([
                function (callback) {
                    if (data.search == "" || data.search == undefined) {
                        countObj = {
                            "status": true
                        };
                    } else {
                        countObj = {
                            "name": {
                                $regex: search,
                                $options: "i"
                            },
                            "status": true
                        }
                    }
                    Blog.count(countObj).exec(function (err, number) {
                        // console.log("number count", number);
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else if (number && number !== "") {
                            // console.log("number", number);
                            newreturns.total = number;
                            newreturns.totalpages = Math.ceil(number / data.pagesize);
                            callback(null, newreturns);
                        } else {
                            callback(null, newreturns);
                        }
                    });
                },
                function (callback) {
                    // console.log("queryString", queryString);
                    Blog.find(queryString).populate("tags", "_id name").skip(data.pagesize * (data.pagenumber - 1)).limit(data.pagesize).sort({
                        date: -1
                    }).exec(function (err, tagFound) {
                        if (err) {
                            console.log("Blog >>> getBlogByTags >>> Blog.aggregate >>> err", err);
                            callback(err, []);
                        } else {
                            var option = {
                                path: "tags",
                                model: "Tags"
                            }
                            newreturns.data = tagFound;
                            callback(null, newreturns);
                        }
                    })
                }
            ],
            function (err, data4) {
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
    getNextBlog:  function (data, callback) {
        var blogDate=data.blogDate;
        console.log("blogDate",blogDate);
        var ltDate = new Date();
        this.find({
            timestamp: {
                $gt: blogDate,
                $lte: ltDate
            }
        }).sort({
            timestamp: 1
        }).limit(1).exec(function (err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else if (found && Object.keys(found).length > 0) {
                // console.log("found",found);
                found=found[0]._id;
                callback(null, found);
            } else {
                console.log("empty",found);
                callback(null, {});
            }
        });
    },
    getPrevBlog: function (data, callback) {
        var blogDate=data.blogDate;
        console.log("blogDate",blogDate);
        var gtDate = '2000-09-07T12:33:32.477Z'
        this.find({
            timestamp: {
                $gt: gtDate,                
                $lt: blogDate           
            }
        }).sort({
            timestamp: -1
        }).limit(1).exec(function (err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else if (found && Object.keys(found).length > 0) {
                // console.log("found",found);
                found=found[0]._id;
                callback(null, found);
            } else {
                console.log("empty",found);
                callback(null, {});
            }
        });
    }
};
module.exports = _.assign(module.exports, models);



//findLimited code
//   findLimited: function (data, callback) {
//         var newreturns = {};
//         newreturns.data = [];
//         var check = new RegExp(data.search, "i");
//         data.pagenumber = parseInt(data.pagenumber);
//         data.pagesize = parseInt(data.pagesize);
//         async.parallel([
//                 function (callback) {
//                     Blog.count({
//                         name: {
//                             '$regex': check
//                         }
//                     }).exec(function (err, number) {
//                         if (err) {
//                             console.log(err);
//                             callback(err, null);
//                         } else if (number && number !== "") {
//                             newreturns.total = number;
//                             newreturns.totalpages = Math.ceil(number / data.pagesize);
//                             callback(null, newreturns);
//                         } else {
//                             callback(null, newreturns);
//                         }
//                     });
//                 },
//                 function (callback) {
//                     Blog.find({
//                         name: {
//                             '$regex': check
//                         }
//                     }).populate("tags", "_id name").skip(data.pagesize * (data.pagenumber - 1)).limit(data.pagesize).sort({
//                         date: -1
//                     }).exec(function (err, data2) {
//                         if (err) {
//                             console.log(err);
//                             callback(err, null);
//                         } else if (data2 && data2.length > 0) {
//                             newreturns.data = data2;
//                             callback(null, newreturns);
//                         } else {
//                             callback(null, newreturns);
//                         }
//                     });
//                 }
//             ],
//             function (err, data4) {
//                 if (err) {
//                     console.log(err);
//                     callback(err, null);
//                 } else if (data4) {
//                     callback(null, newreturns);
//                 } else {
//                     callback(null, newreturns);
//                 }
//             });
//     },
