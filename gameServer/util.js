function encrypt(msg) {
	var length = msg.length;
	var encrypted = "";

	for (i = 0; i < length/2; ++i) {
		encrypted += msg[i*2];
	}

	for (i = 0; i < length/2; ++i) {
		encrypted += msg[(i*2)+1];
	}

	return encrypted;
}

function decrypt(stream) {
	var length = stream.length;
	var msg = "";
	
	for (i = 0; i < length/2; ++i) {
		msg += stream[i];
		msg += stream[(length/2)+i];
	}

	return msg;
}

function fetchId(ab) {
	var id = 0;
	var arr = [];
	var base = 1 << 7;
	var exp = 0;

	for (i = 1; i < ab.byteLength; ++i) {
		if (ab[i] < base) {
			exp = ab[i];
			break;
		}
		
		arr.push(ab[i]);		
	}

	var j = 0;
	for (; j < arr.length; ++j) {
		id += ((arr[j]-base) * (1 << (7*j))); 
	}
	id += (exp * (1 << (7*j)));

	return id;
}

function toStream(msg) {
	var ab = msg.toArrayBuffer();
	var buf = new Buffer(ab.byteLength);

	for (i = 0; i < buf.length; ++i) {
		buf[i] = ab[i];
	}
	
	//return buf.toString('hex');
	return encrypt(buf.toString('hex'));
}

function toBuf(ab) {
	var buf = new Buffer(ab.byteLength);

	for (i = 0; i < buf.length; ++i) {
		buf[i] = ab[i];
	}

	return buf;
}

function toArrBuf(buffer) {
	var ab = new ArrayBuffer(buffer.length);
	
	for (i = 0; i < buffer.length; ++i) {
		ab[i] = buffer[i];
	}

	return ab;
}

function UUID() {
	 var str = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx';
	 return str.replace(/[xy]/g, function(c) {
		 var r = Math.random() * 16|0, v = c == 'x' ? r : (r&0x3|0x8);
		 return v.toString(16);
	 });
}

exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.fetchId = fetchId;
exports.toStream = toStream;
exports.toBuf = toBuf;
exports.toArrBuf = toArrBuf;
exports.UUID = UUID;
