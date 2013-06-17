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

var currentDate = new Date();

Date.prototype.today = function() {
	return ((this.getDate() < 10)?'0':'') + this.getDate() + '_'
		+ (((this.getMonth()+1) < 10)?'0':'') + (this.getMonth()+1) + '_'
		+ this.getFullYear();
};

Date.prototype.timeNow = function() {
	return ((this.getHours() < 10)?'0':'') + this.getHours() + '_'
		+ ((this.getMinutes() < 10)?'0':'') + this.getMinutes() + '_'
		+ ((this.getSeconds() < 10)?'0':'') + this.getSeconds();
};

exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.fetchId = fetchId;
exports.toStream = toStream;
exports.toBuf = toBuf;
exports.toArrBuf = toArrBuf;
exports.UUID = UUID;
exports.currentDate = currentDate;
