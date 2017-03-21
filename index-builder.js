var fs = require('fs');

var result = "require('unfetch/polyfill');\n";

fs.readFile('src/ErrorBag.js', 'utf8', function (err, data) {
	if (err) {
		return console.log(err);
	}
	result += data;
});

fs.readFile('src/Validator.js', 'utf8', function (err, data) {
	if (err) {
		return console.log(err);
	}
	result += data;
});

fs.readFile('src/FormSpine.js', 'utf8', function (err, data) {
	if (err) {
		return console.log(err);
	}
	result += data;

	fs.writeFile('index.js', result, 'utf8', function (err) {
		if (err) return console.log(err);
	});
});