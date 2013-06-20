var log = require('./log');

var METRICDELAY = 50000;

var metricCallback = function () {
		var currentDate = new Date();
	
		var hours = currentDate.getHours();
		var minutes = currentDate.getMinutes();
		var seconds = currentDate.getSeconds();

		console.log(hours + "-" + minutes + "-" + seconds);

		if (hours === 0) {
			if (minutes <= 5) {
				console.log("Date is changed, start to save daily metric.");
			}
		}
	};

var doMetric = function () {
	setInterval(metricCallback, METRICDELAY);

	Console.log('metricInterval has started.');
};

exports.doMetric = doMetric;
