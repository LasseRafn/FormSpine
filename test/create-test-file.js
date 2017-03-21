var fs = require('fs');

fs.readFile('index.js', 'utf8', function (err, data) {
	if (err) {
		return console.log(err);
	}
	var result = data.replace(/require\('unfetch\/polyfill'\);/g, 'const fetch = require(\'unfetch\');');

	fs.writeFile('console-test.js', result, 'utf8', function (err) {
		if (err) return console.log(err);
	});
});