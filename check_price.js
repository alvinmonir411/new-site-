const { MongoClient } = require("mongodb");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env.local") });

async function checkPrice() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("MONGODB_URI not found");
        return;
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db("MONGODB_DB");
        const settings = await db.collection("settings").findOne({ _id: "pricing" });
        console.log("Current Price Setting:", settings);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

checkPrice();
