var log = require('./log');
var CCU = require('./session').CCU;
var MINUTE = require('./define').MINUTE;
var weekday = require('./define').weekday;
var lastDay = weekday[new Date().getDay()];
var build = require('./protoBuild');
var request = require('./request').request;
var mysql = require('./mysql');

function UvOff() {
	procedure = 'sea_UpdateUvOff';
	params = '';

	mysql.call(procedure, params, function (results, fields) {});
}

function metric() {
	var callback = function () {
		var curDate = new Date();
		var day = weekday[curDate.getDay()];

		var ConcurrentUser = build.ConcurrentUser;
		var req = new ConcurrentUser();
		req['ccu'] = CCU();

		request(req);

		// daily
		if (lastDay !== day) {
			lastDay = day;

			var procedure = 'sea_LastUv';
			var params = '';
			
			var lastUvCallback = function (results, fields) {
				var uv = results[0][0]['res'];

				var UniqueVisitor = build.UniqueVisitor;
				var req = new UniqueVisitor();
				req['uv'] = uv;

				request(req);

				// weekly
				var weekly = day === "Mon";

				if (weekly) {
					procedure = 'sea_RetentionRage;'
					params = '';

					var rrCallback = function (results, fields) {
						var rr = results[0][0]['res'];
						
						var RetentionRate = build.RetentionRate;
						var req = new RetentionRate();
						req['rr'] = rr;
						
						request(req);

						UvOff();
					};
				} else {
					UvOff();
				}
			};

			mysql.call(procedure, params, lastUvCallback);

			var PeakConcurrentUser = build.PeakConcurrentUser;
			var req = new PeakConcurrentUser();

			request(req);
		}
	};

	setInterval(callback, MINUTE * 5);
}

exports.metric = metric;
