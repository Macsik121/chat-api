const { MongoClient } = require('mongodb');
const uri: string = "mongodb+srv://Macsick121:AsDf1234@cluster0.dtorr.mongodb.net/chat?retryWrites=true&w=majority";

let db: any;

function getDb() {
    return db;
}

async function connectToDb() {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        db = await client.db();
        console.log('MongoDB has been connected with uri:', uri);
    } catch (error) {
        console.log(error);
    }
}

export default {
    connectToDb,
    getDb
}
