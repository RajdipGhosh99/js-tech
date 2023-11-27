
const ObjectModel = require('../Models/object.model')
const fs = require('fs');
const path = require('path');
const env = require('../constants')
const { v4: uuidv4 } = require('uuid');
const objectModel = require('../Models/object.model');
const { getCurves } = require('crypto');

const __path = path.join('public', env.DIR_NAME)

const getObject = async (req, res) => {
    const { bucket, key } = req.params;

    try {
        const object = await ObjectModel.findOne({ bucket, key });
        if (!object) {
            return res.status(404).json({ message: 'Object not found' });
        }

        const filePath = path.join(dataDirectory, object.filePath);
        const data = await fs.readFile(filePath, 'utf-8');
        res.json({ bucket, key, data: JSON.parse(data) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const putObject = async (req, res) => {
    try {
        const { file } = req
        let _data = []
        let filePath = null
        let cursor = {}
        //helper
        async function getFilePath(key) {
            const obj = await objectModel.findOne({ 'key': key })
            return obj
        }

        if (req?.params?.key && file) {
            cursor = { key: req.params.key }
            let obj = await getFilePath(req.params.key)
            if (obj.file_path && fs.existsSync(path.join(process.cwd(), obj.file_path))) {
                fs.unlinkSync(path.join(process.cwd(), obj.file_path))
            }
            if (!obj) {
                return res.status(500).json({ status: 'error', error: 'Existing file obj not found' });
            }

            const directoryPath = path.join(process.cwd(), __path, obj.bucket);

            // Save the file to the local file system
            const destination = path.join(directoryPath, file.originalname)
            console.log(path.join(process.cwd(), file.path), destination);
            fs.renameSync(path.join(process.cwd(), file.path), destination);

            _data = await ObjectModel.updateOne(cursor, {
                file_name: file.originalname, file_path: 'public' + destination.split('public')[1]
            })
        } else {
            return res.status(422).json({ error: "Please enter a valid payload", status: 'error' });
        }

        return res.json({ data: _data, status: 'success' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 'error', error: error.message });
    }
}



const listObjects = async (req, res) => {
    const { bucket } = req.params;

    try {
        const objects = await ObjectModel.aggregate([
            {
                $match: {
                    bucket,
                    is_deleted: false
                }
            }, {
                $project: {
                    key: 1,
                    file_path: 1,
                    file_name: 1
                }
            }
        ]);
        res.json({ data: objects.map(d => ({ ...d, file_path: path.join(process.cwd(), d.file_path) })), status: 'success' });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
}

const listBuckets = async (req, res) => {
    try {
        const buckets = await ObjectModel.distinct('bucket');
        res.json({ data: buckets, status: 'success' });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
}

const addObject = async (req, res) => {

    const directoriesToCreate = ['public', __path];

    // Create directories if they don't exist
    directoriesToCreate.forEach(directory => {
        const directoryPath = path.join(process.cwd(), directory);

        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }
    });

    const { bucket } = req.params;
    const { file } = req;

    if (!file || !bucket) {
        return res.status(422).json({ message: 'Not a valid request' });
    }

    try {
        const directoryPath = path.join(process.cwd(), __path, bucket);

        //Create the directory if it doesn't exist
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath);
        }

        // Save the file to the local file system
        const destination = path.join(directoryPath, file.originalname)
        await fs.renameSync(path.join(process.cwd(), file.path), destination);

        //Find same file name in DB
        await objectModel.updateMany({ bucket, file_name: file.originalname, is_deleted: false }, { is_deleted: true })

        // Save the object information to MongoDB
        const data = await ObjectModel.create({ bucket, key: uuidv4(), file_name: file.originalname, file_path: 'public' + destination.split('public')[1] });

        res.json({ message: 'Object added successfully', status: 'success', data: [data] });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', error: error });
    }
}


const deleteObjects = async (req, res) => {
    try {
        let _data = []
        let filePath = null
        let cursor = {}

        async function getFilePath(key) {
            const obj = await objectModel.findOne({ key: key })
            if (obj?.file_path) {
                return path.join(process.cwd(), obj.file_path)
            }
            return null
        }

        // if (req.query.file_name) {
        //     cursor = { file_name: req.query.file_name, is_deleted: false }
        //     _data = await ObjectModel.updateOne(cursor, { is_deleted: true })
        // } else 
        if (req.query.key) {
            cursor = { key: req.query.key, is_deleted: false }
            _data = await ObjectModel.updateOne(cursor, { is_deleted: true })
        } else {
            res.status(422).json({ error: "Please enter a valid key", status: 'error' });
        }

        filePath = await getFilePath(req.query.key)
        console.log(filePath);
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }

        res.json({ data: _data, status: 'success' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', error: error.message });
    }
}


module.exports = {
    getObject,
    addObject,
    putObject,
    listBuckets,
    listObjects,
    deleteObjects
}
