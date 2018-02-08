module.exports = {
    index: function (req, res) {
        res.metaView();
    },
    download: function (req, res) {
        Config.readUploaded(req.param("filename"), null, null, null, res);
    },
    backend: function (req, res) {
        var env = require("../../config/env/" + sails.config.environment + ".js");
        res.view("backend", {
            jsFiles: jsFilesBackend,
            title: "Backend",
            description: "Backend",
            keywords: "Backend",
            adminurl: env.realHost + "/api/",
        });
    },

    gitPull: function (req, res) {
        function gitPull() {
            exec('git pull', function (error, stdout, stderr) {
                if (error) {
                    return;
                }
                res.callback(error, {
                    stdout: stdout,
                    stderr: stderr
                });
            });
        }

        function decryptData(text) {
            if (text) {
                if (moment.unix(text).isBetween(moment().add(-1, "minute"), moment().add(1, "minute"))) {
                    gitPull();
                } else {
                    res.notFound();
                }
            } else {
                res.notFound();
            }
        }
        if (req.params && req.params.data) {
            decryptData(req.params.data);
        } else {
            res.notFound();
        }
    },

    category: function (req, res) {
        console.log("---------------------------------");
        var temp1 = req.params[0];
        var count1 = (temp1.match(/[/]/g) || []).length;
        if (req.params || count1 == 1) {
            var catID = temp1.slice(temp1.lastIndexOf('/') + 1, temp1.length);
            Category.getOne({
                _id: catID
            }, function (err, data) {
                if (err) {
                    res.callback(err, data);
                } else if (_.isEmpty(data)) {
                    res.callback(err, data);
                } else {
                    var catData = data;
                    res.metaView({
                        title: catData.name,
                        description: catData.description,
                        image: catData.image
                    });
                }
            });
        } else if (req.params || count1 == 2) {
            var subCatID = temp1.slice(temp1.lastIndexOf('/') + 1, temp1.length);
            SubCategory.getOne({
                _id: subCatID
            }, function (err, data) {
                if (err) {
                    res.callback(err, data);
                } else if (_.isEmpty(data)) {
                    res.callback(err, data);
                } else {
                    var subCatData = data;
                    res.metaView({
                        title: subCatData.subCatName,
                        description: subCatData.subCatDescription
                    });
                }
            });
        } else {
            res.metaView();
        }
    },

    blog: function (req, res) {
        console.log("---------------------------------");        
        var temp1 = req.params[0];
        if (req.params) {
            var blogID = temp1.slice(temp1.lastIndexOf('/') + 1, temp1.length);
            Blog.getOne({
                _id: blogID
            }, function (err, data) {
                if (err) {
                    res.callback(err, data);
                } else if (_.isEmpty(data)) {
                    res.callback(err, data);
                } else {
                    var blogData = data;
                    res.metaView({
                        title: blogData.name,
                        description: blogData.description,
                        image: blogData.image
                    });
                }
            });
        } else {
            res.metaView();
        }
    }
};
