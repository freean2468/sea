var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var format = require('util').format;

var host = process.env['MONGO_NODE_DRIVER_HOST'] != null ? process.env['MONGO_NODE_DRIVER_HOST'] : 'localhost';
var port = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : Connection.DEFAULT_PORT;

function insert(coll, doc, callback) {
	Db.connect(format('mongodb://%s:%s/sea_log?w=1', host, port), function (err, db) {
		if (err) {
			console.log(err);
			throw err;
		}
		db.collection(coll, function(err, collection) {
			if (err) {
				console.log(err);
				throw err;
			}
			collection.insert(doc, {safe: true}, function (err, res) {
				if (err) {
					console.log(err);
					throw err;
				}
				callback(res);
				db.close();
			});
		});
	});
}

function find(coll, doc, callback) {
	Db.connect(format('mongodb://%s:%s/sea_log?w=1', host, port), function (err, db) {
		if (err) {
			console.log(err);
			throw err;
		}
		db.collection(coll, function(err, collection) {
			if (err) {
				console.log(err);
				throw err;
			}
			collection.find(doc, function(err, cursor) {
				if (err) {
					console.log(err);
					throw err;
				}
				cursor.toArray(function (err, items) {
					if (err) {
						console.log(err);
						throw err;
					}
					callback(items);
					db.close();
				});
			});
		});
	});
}

function drop(coll, doc, callback) {
	
}

function update(coll, where, doc, callback) {
	Db.connect(format('mongodb://%s:%s/sea_log?w=1', host, port), function (err, db) {
		if (err) {
			console.log(err);
			throw err;
		}
		db.collection(coll, function (err, collection) {
			if (err) {
				console.log(err);
				throw err;
			}
			collection.update(where, doc, function (err, res) {
				if (err) {
					console.log(err);
					throw err;
				}
				console.log(res);
				callback(res);					
				db.close();
			});
		});
	});
}

exports.insert = insert;
exports.drop = drop;
exports.find = find;
exports.update = update;
