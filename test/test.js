import test from "ava";
import sinon from "sinon";
import FormSpine from "../dist/formspine.umd";
const fetch = require('unfetch');
global.fetch = fetch;

let xhr = {
	setRequestHeader: sinon.spy(),
	getAllResponseHeaders: sinon.stub().returns('X-Foo: bar\nX-Foo:baz'),
	open: sinon.spy(),
	send: sinon.spy(),
	status: 200,
	statusText: 'OK',
	responseText: '{"message":"OK"}',
	responseURL: '/'
};

let xhrText = {
	setRequestHeader: sinon.spy(),
	getAllResponseHeaders: sinon.stub().returns('X-Foo: bar\nX-Foo:baz'),
	open: sinon.spy(),
	send: sinon.spy(),
	status: 200,
	statusText: 'OK',
	responseText: 'Success',
	responseURL: '/'
};

let failedXhr = {
	setRequestHeader: sinon.spy(),
	getAllResponseHeaders: sinon.stub().returns('X-Foo: bar\nX-Foo:baz'),
	open: sinon.spy(),
	send: sinon.spy(),
	status: 403,
	statusText: 'FAIL',
	responseText: '{"name":["Name is required."]}',
	responseURL: '/'
};

let failedXhrText = {
	setRequestHeader: sinon.spy(),
	getAllResponseHeaders: sinon.stub().returns('X-Foo: bar\nX-Foo:baz'),
	open: sinon.spy(),
	send: sinon.spy(),
	status: 403,
	statusText: 'FAIL',
	responseText: 'Some random error happened',
	responseURL: '/'
};

global.XMLHttpRequest = sinon.stub().returns(xhr);

test('should return form data as an Object, key value based', function (t) {
	let formFields = {
		name: {
			value: "Lasse Rafn"
		},
		email: {}
	};

	let expectedFormFields = {
		name: "Lasse Rafn",
		email: "lasserafn@gmail.com"
	};

	const form = new FormSpine('', formFields);

	form.fields.email.value = "lasserafn@gmail.com";

	t.true(JSON.stringify(form.data()) === JSON.stringify(expectedFormFields));
});


test('should clear all fields', function (t) {
	let formFields = {
		name: {
			value: "Lasse Rafn"
		},
		email: {}
	};

	let expectedFormFields = {
		name: "",
		email: ""
	};

	const form = new FormSpine('', formFields);

	form.clear();

	t.true(JSON.stringify(form.data()) === JSON.stringify(expectedFormFields));
});

test('should reset fields to original state', function (t) {
	let formFields = {
		name: {
			value: "Lasse Rafn"
		},
		email: {
			value: "JohnDoe@gmail.com"
		}
	};

	let expectedFormFields = {
		name: "Lasse Rafn",
		email: "JohnDoe@gmail.com"
	};

	const form = new FormSpine('', formFields);

	form.fields.name.value = "John Doe";

	form.reset();

	t.true(JSON.stringify(form.data()) === JSON.stringify(expectedFormFields));
});

test('form submit should be called on post,delete,put', function (t) {
	const form = new FormSpine('/', {});

	form.submit = sinon.spy();

	form.post();
	form.delete();
	form.put();

	t.true(form.submit.callCount === 3)
});

test('failed submit should return errors, and set errors', function (t) {
	global.XMLHttpRequest = sinon.stub().returns(failedXhr);
	const form = new FormSpine('/', {});

	const response = form.post();

	failedXhr.onload();

	return response.then(function (data) {
		t.fail();
	}).catch(function (errors) {
		t.true(JSON.stringify(errors) === '{"name":["Name is required."]}');
		t.true(form.errors.get('name').length === 1);
		t.true(form.errors.count() === 1);
	});
});

test('successful submit should return message, and reset errors', function (t) {
	global.XMLHttpRequest = sinon.stub().returns(xhr);
	const form = new FormSpine('/', {});

	const response = form.post();

	xhr.onload();

	return response.then(function (data) {
		t.true(JSON.stringify(data) === '{"message":"OK"}');
		t.true(form.errors.count() === 0);
	}).catch(function (errors) {
		t.fail();
	});
});

test('failed submit (with non-json response) should return error, and set error - from responseText', function (t) {
	global.XMLHttpRequest = sinon.stub().returns(failedXhrText);
	const form = new FormSpine('/', {});

	const response = form.post();

	failedXhrText.onload();

	return response.then(function (data) {
		t.fail();
	}).catch(function (errors) {
		t.true(errors === "Some random error happened");
		t.true(form.errors.get('general').length === 1);
		t.true(form.errors.count() === 1);
	});
});

test('success submit (with non-json response) should return response, and reset errors', function (t) {
	global.XMLHttpRequest = sinon.stub().returns(xhrText);
	const form = new FormSpine('/', {});

	const response = form.post();

	xhrText.onload();

	return response.then(function (data) {
		t.true(data === "Success");
		t.true(form.errors.count() === 0);
	}).catch(function (errors) {
		t.fail();
	});
});

test('Validation rules are considered prior to fetch call', function (t) {
	const form = new FormSpine('/', {
		name: {
			required: true
		},
		email: {
			value: "a-very-long-email-address@some-long-domain.com",
			max_length: 20
		},
		phone: {
			value: "a non-phone number",
			only_digits: true,
			max_length: 8
		},
		password: {
			value: "my-password",
			min_length: 20,
			must_match: "password_confirmation"
		},
		password_confirmation: {
			value: "not-the-same-password",
			required: true
		},
		company: {
			value: "Google",
			regex: /(Apple|Amazon)/
		},
		a_string: {
			value: "Hello m4n",
			no_digits: true
		},
		accepts_terms: {
			checked: true,
			value: false
		}
	});

	return form.post().then(function () {
		t.fail();
	}).catch(function () {
		t.true(form.errors.get('name').length === 1);
		t.true(form.errors.get('email').length === 1);
		t.true(form.errors.get('phone').length === 2);
		t.true(form.errors.get('password').length === 2);
		t.true(form.errors.get('password_confirmation').length === 0);
		t.true(form.errors.get('company').length === 1);
		t.true(form.errors.get('a_string').length === 1);
		t.true(form.errors.get('accepts_terms').length === 1);
		t.true(form.errors.count() === 9);
	});
});

test('form resets if asked to', function (t) {
	global.XMLHttpRequest = sinon.stub().returns(xhr);

	const form = new FormSpine('/', {
		name: {
			value: "Lasse Rafn"
		},
		email: {}
	}, {
		resetOnSuccess: true
	});

	form.fields.name.value = "John Doe";
	form.fields.email.value = "demo@gmail.com";

	const response = form.post();
	xhr.onload();

	return response.then(function () {
		t.true(form.fields.name.value === "Lasse Rafn");
		t.true(form.fields.email.value === "");
	});
});

test('form can clear', function (t) {
	const form = new FormSpine('/', {
		name: {
			value: "Lasse Rafn"
		},
		email: {}
	});

	form.fields.email.value = "demo@gmail.com";

	form.clear();

	t.true(form.fields.name.value === "");
	t.true(form.fields.email.value === "");
});

test('ErrorBag has errors', function (t) {
	const form = new FormSpine('/', {
		name: {
			value: "Lasse Rafn"
		},
		email: {required: true}
	});

	return form.post().then(function (data) {
		t.fail();
	}).catch(function (errors) {
		t.true(form.errors.has('email'));
		t.true(!form.errors.has('name'));
	});
});

test('ErrorBag can get first error', function (t) {
	const form = new FormSpine('/', {
		name: {
			value: "Lasse Rafn"
		},
		email: {required: true, min_length: 100}
	});

	return form.post().then(function (data) {
		t.fail();
	}).catch(function (errors) {
		t.true(form.errors.first('email') === 'The email field must be at least 100 characters.');
	});
});

test('ErrorBag can clear errors and single errors', function (t) {
	const form = new FormSpine('/', {
		name: {
			value: "Lasse Rafn"
		},
		email: {required: true}
	});

	form.post().then(function () {
		t.fail();
	}).catch(function () {
		form.errors.clear();

		t.true(form.errors.count() === 0);
	});

	form.post().then(function () {
		t.fail();
	}).catch(function () {
		form.errors.clear('email');

		t.true(form.errors.count() === 0);
	});
});

test('form can have custom error messages', function (t) {
	const form = new FormSpine('/', {
		name: {
			value: "Lasse Rafn"
		},
		email: {required: true}
	}, {messages: {required: "Hello. Please input this field, good sir."}});

	return form.post().then(function () {
		t.fail();
	}).catch(function () {
		t.true(form.errors.first('email') === 'Hello. Please input this field, good sir.');
	});
});

test('Errorbag can set errors', function (t) {
	const form = new FormSpine('/', {
		name: {}
	});

	form.errors.set({name: "Something went wrong!"});

	t.true(form.errors.first('name') === 'Something went wrong!');
});

test('Can set custom headers', function (t) {
	const form = new FormSpine('/', {}, {
		headers: {
			"X-TEST": true
		}
	});

	t.true(JSON.stringify(form.headers) === "{\"Content-Type\":\"application/json\",\"X-TEST\":true}");
});

test('Fields can have custom names', function (t) {
	const form = new FormSpine('/', {
		full_name: {
			name: "full name",
			required: true
		},
		email: {
			required: true
		},
	});

	return form.post().then(function () {
		t.fail();
	}).catch(function () {
		t.true(form.errors.first('full_name') === "The full name field is required.");
		t.true(form.errors.first('email') == "The email field is required.");
	});
});

test('Fields can have default values', function (t) {
	const form = new FormSpine('/', {
		full_name: {
			value: "John Doe"
		},
		email: {},
	});

	t.true(form.fields.full_name.value === "John Doe");
	t.true(form.fields.email.value === "");
});