const { MongoClient } = require('mongodb');
const uri: string = "mongodb+srv://Macsick121:AsDf1234@cluster0.dtorr.mongodb.net/chat?retryWrites=true&w=majority";
// mongo shell connection link:
// mongosh "mongodb+srv://cluster0.dtorr.mongodb.net/myFirstDatabase" --username Macsick121

let db: any;

export function getDb() {
    return db;
}

export async function connectToDb() {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        db = await client.db();
        console.log('MongoDB has been connected with uri:', uri);
    } catch (error) {
        console.log(error);
    }
}

