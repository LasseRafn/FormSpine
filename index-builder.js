var fs = require('fs');

var validatorData,
	errorBagData;

/*
 * This is a ugly mess.
 * Todo: Fix later
 */

fs.readFile('src/Validator.js', 'utf8', function (err, data) {
	if (err) {
		return console.log(err);
	}

	data = data.replace('module.exports = Validator;', '');

	validatorData = data;

	fs.readFile('src/ErrorBag.js', 'utf8', function (err, data) {
		if (err) {
			return console.log(err);
		}

		data = data.replace('module.exports = ErrorBag;', '');

		errorBagData = data;
	});

	var result = "require('unfetch/polyfill');\n";

	fs.readFile('src/FormSpine.js', 'utf8', function (err, data) {
		if (err) {
			return console.log(err);
		}

		result += data.replace('const Validator = require("./Validator");', validatorData)
			.replace('const ErrorBag = require("./ErrorBag");', errorBagData);

		fs.writeFile('index.js', result, 'utf8', function (err) {
			if (err) return console.log(err);
		});
	});
});