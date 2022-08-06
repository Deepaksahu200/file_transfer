const express = require('express')
const app = express();
const path = require('path')
const port = process.env.PORT || 3001;
const ejs = require('ejs')
const multer = require("multer")
const fs = require('fs')
const rimraf = require('rimraf');

app.use(express.json())
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

var uploadsDir = __dirname + "/public";

setInterval(() => {
    fs.readdir(uploadsDir, (err, files) => {
        files.forEach((file, index) => {
            fs.stat(path.join(uploadsDir, file), (err, stat) => {
                var endTime, now;
                if (err) {
                    return console.error(err);
                }
                now = new Date().getTime();
                endTime = new Date(stat.ctime).getTime() + 600000;
                if (now > endTime) {
                    return rimraf(path.join(uploadsDir, file), function (err) {
                        if (err) {
                            return console.error(err);
                        }
                        console.log("successfully deleted");
                    });
                }
            });
        });
    });
}, 10000);


app.get('/', (req, res) => {
    res.render('index')
})

/*

Input path 

*/

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public");
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

var maxSize = 10000 * 1024 * 1024;

var upload = multer({
    storage: storage,
    limits: { fileSize: maxSize }
}).single("file");


// var maxSize = 10000 * 1024 * 1024;

var upload = multer({
    storage: storage,
    limits: { fileSize: maxSize }
}).single("file");

/*

File uploading

*/

app.post('/uploadfile', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.log(err)
        }
        else {
            // console.log({ data: req.file.path })
            res.json({ data: req.file.filename })
        }
    })
})

/*

get

*/

app.get('/files/:id', (req, res) => {

    console.log(req.params.id)
    res.render('display', { path: req.params.id })
})

/*



*/

app.get("/download", (req, res) => {
    var pathoutput = req.query.path;
    // console.log(pathoutput);
    var fullpath = path.join(__dirname, pathoutput);
    // console.log(fullpath)
    res.download(fullpath, (err) => {
        if (err) {
            res.send(err);
        }

    });
});




// upload post request 
app.use(express.static(path.join(__dirname + "public")))

app.listen(port, (err) => {
    if (err) {
        return console.log({ Error: " Server not started" });
    }
    console.log(`Server startes at http://localhost:${port} `)
})