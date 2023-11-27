const express = require('express');
const controller1 = require('./object.controller')
const multer = require('multer');
const env = require('../constants')
const path = require('path');
const fs = require('fs');

// Multer configuration with disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const pth = path.join(process.cwd(), 'temp')
        if (!fs.existsSync(pth)) {
            fs.mkdirSync(pth)
        }
        cb(null, 'temp/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })

const router = express.Router()

// Get Object
router.get('/getObject/:bucket/:key', controller1.getObject);

// Add Object
router.post('/addObject/:bucket', upload.single('file'), controller1.addObject);

// Put Object
router.post('/putObject/:key', upload.single('file'), controller1.putObject);

// List Buckets
router.get('/listBuckets', controller1.listBuckets);

// List Objects
router.get('/listObjects/:bucket', controller1.listObjects);

// Delete Objects
router.get('/deleteObject', controller1.deleteObjects);


module.exports = router