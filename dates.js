const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'test';

// Create a new MongoClient
const client = new MongoClient(url);

(async function() {

	try {
		await client.connect();
		console.log("Connected correctly to server");

		const db = client.db(dbName);

		// Get the collection
		const col = db.collection('dates');

		// Insert multiple documents
		const r = await col.insertMany([{ date: (new Date()).toString() }]);
		assert.equal(1, r.insertedCount);

		// Get documents
		const docs = await col.find().toArray();
		console.log(docs)

	} catch (err) {
		console.log(err.stack);
	}

  	// Close connection
  	client.close();
})();