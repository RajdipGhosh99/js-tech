const mongoose = require('mongoose');

const objectSchema = new mongoose.Schema({
    bucket: {
        type: String,
        trim: true
    },
    key: {
        type: String,
        trim: true
    },
    file_path: {
        type: String,
        trim: true
    },
    file_name: {
        type: String,
        trim: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('object_datas', objectSchema);

