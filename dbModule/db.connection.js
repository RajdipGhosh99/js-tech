
const mongoose = require('mongoose');
const env = require('../constants')

const config = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

const mongo_srv = 'mongodb://localhost:27017/s3_mock'
// const mongo_srv=`mongodb+srv://${env.DB_USER}:${env.DB_PASS}@cluster0.k25vad1.mongodb.net/?retryWrites=true&w=majority?directConnection=true`
const connection1 = mongoose.connect(mongo_srv)

// Event handlers for the MongoDB connection
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.connection.once('open', () => {
    console.log(`Connected to MongoDB database: s3_mock`);
});
module.exports = connection1