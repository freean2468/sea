var mongodb = require('./mongodb');
var verProtocol = require('./verProtocol');
var c2sProtocol = require('./c2sProtocol');
var s2cProtocol = require('./s2cProtocol');
var r2gProtocol = require('./r2gProtocol');
var g2rProtocol = require('./g2rProtocol');
var element = require('./protocolElement');
var assert = require('assert');
var toRank = require('./request');
var log = require('./log');

function write(res, type, str) {
	res.writeHead(200, {'Content-Type': type, 'Content-Length':str.length});
	res.write(str);
	res.end();
}

function requestRankingHandler(response, data){
	var requestRanking = g2rProtocol.requestRanking;
	assert.notEqual(data['k_id'], '');
	requestRanking['k_id'] = data['k_id'];
	assert.notEqual(data['result'], 0);
	requestRanking['result'] = data['result'];
} // end requestRankingHandler

exports.requestRankingHandler = requestRankingHandler;
