const fetch = require('unfetch');
class ErrorBag {
	constructor() {
		this.errors = {};
	}

	count() {
		let num_errors = 0;

		for (let error in this.errors) {
			num_errors += this.errors[error].length;
		}

		return num_errors;
	}

	has(field) {
		return this.errors[field] !== undefined;
	}

	get(field) {
		return this.errors[field] || [];
	}

	first(field) {
		const errors = this.get(field);

		return errors.length > 0 ? errors[0] : false;
	}

	set(errors) {
		for (let error in errors) {
			if (typeof errors[error] === "string") {
				errors[error] = [errors[error]];
			}
		}

		this.errors = errors;
	}

	clear(field) {
		if (field) {
			delete this.errors[field];

			return;
		}

		this.errors = {};
	}
}

module.exports = ErrorBag;
class Validator {
	constructor(messages) {
		this.messages = {
			regex: "The :field field is invalid.",
			required: "The :field field is required.",
			no_digits: "The :field field may not contain digits.",
			only_digits: "The :field field may only contain digits.",
			must_match: "The :field field match the :must_match field.",
			min_length: "The :field field must be at least :min_length characters.",
			max_length: "The :field field must not be longer than :max_length characters.",
			checked: "The :field must be checked."
		};

		for (let message in messages || {}) {
			this.messages[message] = messages[message];
		}
	}

	validate(fields) {
		let errors = {};

		for (let field in fields) {
			let validateResult = this.validateField(fields[field], fields);

			if (validateResult.length > 0) {
				errors[field] = validateResult;
			}
		}
		return errors;
	}

	validateField(field, fields) {
		let errors = [];

		if (field.min_length && field.value.length < field.min_length) {
			errors.push(this.makeMessage(field.name, "min_length", {
				min_length: field.min_length
			}));
		}

		if (field.max_length && field.value.length > field.max_length) {
			errors.push(this.makeMessage(field.name, "max_length", {
				max_length: field.max_length
			}));
		}

		if (field.required && field.value.length === 0) {
			errors.push(this.makeMessage(field.name, "required"));
		}

		if (field.must_match && field.value !== fields[field.must_match].value) {
			errors.push(this.makeMessage(field.name, "must_match", {
				must_match: fields[field.must_match].name
			}));
		}

		if (field.only_digits && /\D/.test(field.value)) {
			errors.push(this.makeMessage(field.name, "only_digits"));
		}

		if (field.no_digits && /\d/.test(field.value)) {
			errors.push(this.makeMessage(field.name, "no_digits"));
		}

		if (field.regex && !field.regex.test(field.value)) {
			errors.push(this.makeMessage(field.name, "regex", {regex: field.regex}));
		}

		if (field.checked && !field.value) {
			errors.push(this.makeMessage(field.name, "checked"));
		}

		return errors;
	}

	makeMessage(field, type, data) {
		let message = this.messages[type];

		message = message.replace(":field", field);

		for (let item in data) {
			message = message.replace(":" + item, data[item]);
		}

		return message;
	}
}

module.exports = Validator;


class FormSpine {
	constructor(url, fields, options) {
		this.options = options || {};
		this.errors = new ErrorBag;
		this.setupFields(fields);
		this.url = url;
		this.headers = {'Content-Type': 'application/json'};

		this.resetOnSuccess = this.options.resetOnSuccess || false;
		this.validator = new Validator(this.options.messages || {});

		if (this.options['headers'] !== undefined) {
			for (let header in this.options.headers) {
				this.headers[header] = this.options.headers[header];
			}
		}
	}

	setupFields(fields) {
		this.fields = {};
		this.originalValues = {};

		for (let field in fields) {
			fields[field]["value"] = fields[field].value || "";
			fields[field]["name"] = fields[field].name || field;

			this.fields[field] = fields[field];
			this.originalValues[field] = this.fields[field].value;
		}
	}

	validate() {
		this.errors.clear();

		return this.validator.validate(this.fields);
	}

	data() {
		let formData = {};

		for (let field in this.fields) {
			formData[field] = this.fields[field].value;
		}

		return formData;
	}

	clear() {
		for (let field in this.fields) {
			this.fields[field].value = "";
		}

		this.errors.clear();
	}

	reset() {
		for (let field in this.fields) {
			this.fields[field].value = this.originalValues[field];
		}

		this.errors.clear();
	}

	submit(method) {
		var self = this;

		return new Promise(function (resolve, reject) {
			const validationResponse = self.validate();

			if (Object.keys(validationResponse).length > 0) {
				self.errors.set(validationResponse);
				reject(validationResponse);

				return false;
			}

			fetch(self.url, {
				method: method.toUpperCase(),
				credentials: 'include',
				headers: self.headers,
				body: JSON.stringify(self.data())
			}).then(function (response) {
				if (response.ok) {
					response.json().then(function (data) {
						self.onSuccess(data);
						resolve(data);
					}).catch(function () {
						response.text().then(function (data) {
							self.onSuccess(data);
							resolve(data);
						});
					});
				} else {
					response.json().then(function (data) {
						self.onFail(data);
						reject(data);
					}).catch(function () {
						response.text().then(function (data) {
							self.onFail(data);
							reject(data);
						});
					});
				}
			});
		});
	}

	onSuccess() {
		if (this.resetOnSuccess) {
			this.reset();
		}
	}

	onFail(errors) {
		if (typeof errors === "string") {
			errors = {
				general: [errors]
			};
		}

		if (errors !== undefined) {
			this.errors.set(errors);
		}
	}

	post() {
		return this.submit("post");
	}

	delete() {
		return this.submit("delete");
	}

	put() {
		return this.submit("put");
	}
}

module.exports = FormSpine;