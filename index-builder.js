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

	data = data.replace('export default {Validator};', '');
	data = data.replace('export {Validator};', '');

	validatorData = data;

	fs.readFile('src/ErrorBag.js', 'utf8', function (err, data) {
		if (err) {
			return console.log(err);
		}

		data = data.replace('export default {ErrorBag};', '');
		data = data.replace('export {ErrorBag};', '');

		errorBagData = data;

		//var result = "require('unfetch/polyfill');\n";
		var result = "";

		fs.readFile('src/FormSpine.js', 'utf8', function (err, data) {
			if (err) {
				return console.log(err);
			}

			result += data.replace('import Validator from "./Validator";', validatorData)
				.replace('import ErrorBag from "./ErrorBag";', errorBagData);

			fs.writeFile('src/index.js', result, 'utf8', function (err) {
				if (err) return console.log(err);
			});
		});
	});
});