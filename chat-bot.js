// Packages
const MongoClient = require('mongodb').MongoClient;
const express = require('express')
const assert = require('assert');
const fs = require('fs')

// Express
const app = express()
app.use(express.json())

// Connection URL + Database Name
const url = 'mongodb://tkaing:T12345678@chat-bot-shard-00-00-k7ohr.mongodb.net:27017,chat-bot-shard-00-01-k7ohr.mongodb.net:27017,chat-bot-shard-00-02-k7ohr.mongodb.net:27017/test?ssl=true&replicaSet=chat-bot-shard-0&authSource=admin&retryWrites=true';
const dbName = 'chat-bot';

// GET method route
app.get('/messages/all', function (req, res) {	
	(async function() {
		try {
			const docs = await findAll();
			res.send(docs);
		} catch (err) {
			console.log(err.stack);
		}
	})();
})

// DELETE method route
app.delete('/messages/last', function (req, res) {	
	(async function() {
		try {
			const docs = await findAll();
			await remove(docs);
			res.send(docs);
		} catch (err) {
			console.log(err.stack);
		}
	})();
})

// POST method route
app.post('/chat', function (req, res) {
	(async function() {
		try {
			var message = req.body.msg;
			var words = message.split(' ');
			var k = words[0];

			// Read file
			var content = fs.readFileSync('réponses.json');
			var object = JSON.parse(content);

			if (words.length === 1) {
				var output = (k in object) ? (k + ': ' + object[k])
				: ('Je ne connais pas ' + k + '...');
				await insert(message, output);

				res.send(output);
			}
			if (words.length === 3) {
				// Write in file
				object[k] = words[2];
				var data = JSON.stringify(object);
				fs.writeFileSync('réponses.json', data);

				var output = 'Merci pour cette information !';
				await insert(message, output);

				res.send(output);
			}

		} catch (err) {
			console.log(err.stack);
		}
	})();
})

var port = process.env.PORT || 3000;
app.listen(port, function () {
	console.log('Example app listening on port ', port)
})

// Find all messages
async function findAll() {
	// Connect to db + Get collection
	const client = new MongoClient(url);
	await client.connect();
	const db = client.db(dbName);
	const col = db.collection('messages');

	// Get documents
	const docs = await col.find().toArray();

	client.close();

	return docs;
}

// Insert messages
async function insert(umsg, bmsg) { 
	// Connect to db + Get collection
	const client = new MongoClient(url);
	await client.connect();
	const db = client.db(dbName);
	const col = db.collection('messages');

	// Insert multiple documents
	const r = await col.insertMany([
		{ from: 'user', msg: umsg },
		{ from: 'bot', msg: bmsg }
	]);

	client.close();
}

// Remove messages
async function remove(docs) { 
	// Connect to db + Get collection
	const client = new MongoClient(url);
	await client.connect();
	const db = client.db(dbName);
	const col = db.collection('messages');

	// Remove last docs
	const last1 = docs.pop();
	if (last1 !== undefined) { await col.deleteOne({_id:last1._id}); }
	const last2 = docs.pop();
	if (last2 !== undefined) { await col.deleteOne({_id:last2._id}); }

	client.close();
}