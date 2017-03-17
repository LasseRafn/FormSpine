import test from 'ava';
import sinon from "sinon";

import browserEnv from 'browser-env';
browserEnv();

import {FormSpine} from "../dist/formspine.es";

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