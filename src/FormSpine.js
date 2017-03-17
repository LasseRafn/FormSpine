var Validator = require('./Validator');
var ErrorBag = require('./ErrorBag');
require('unfetch/polyfill');

class FormSpine {
	constructor(url, fields, customErrorMessages, clearOnSuccess) {
		this.errors = new ErrorBag;
		this.setupFields(fields);
		this.url = url;
		this.validator = new Validator(customErrorMessages);
		this.clearOnSuccess = clearOnSuccess !== undefined ? clearOnSuccess : false;
	};

	setupFields(fields) {
		this.fields = {};
		this.originalValues = {};

		for (var field in fields) {
			fields[field]["value"] = fields[field].value ? fields[field].value : "";
			fields[field]["name"] = field;

			this.fields[field] = fields[field];
			this.originalValues[field] = this.fields[field].value;
		}
	};

	validate() {
		this.errors.clear();

		return this.validator.validate(this.fields);
	};

	data() {
		var formData = {};
		for (var field in this.fields) {
			formData[field] = this.fields[field].value;
		}
		return formData;
	};

	clear() {
		for (var field in this.fields) {
			this.fields[field].value = "";
		}
		this.errors.clear();
	};

	reset() {
		for (var field in this.fields) {
			this.fields[field].value = this.originalValues[field];
		}
		this.errors.clear();
	};

	submit(method) {
		var self = this;

		return new Promise(function (resolve, reject) {
			var validationResponse = self.validate();

			if (Object.keys(validationResponse).length > 0) {
				self.errors.set(validationResponse);
				reject(validationResponse);

				return false;
			}

			fetch(self.url, {
				method: method.toUpperCase(),
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(self.data())
			}).then(function (response) {
				if (response.ok) {
					return response;
				} else {
					return Promise.reject(response);
				}
			}).then(function (response) {
				return response.json();
			}).then(function (data) {
				self.onSuccess(data);
				resolve(data);
			}).catch(function (response) {
				if (response.ok !== undefined) {
					response.json().then(function (data) {
						self.onFail(data);
						reject(data);
					}).catch(function (data) {
						self.onFail(response.statusText);
						reject(response.statusText);
					});
				}
				else {
					self.onFail(response.target.responseText);
					reject(response.target.responseText);
				}
			});
		});
	};

	onSuccess(data) {
		if (this.clearOnSuccess) {
			this.reset();
		}
	};

	onFail(errors) {
		if (typeof errors === "string") {
			errors = {
				general: [errors]
			};
		}

		if (errors !== undefined) {
			this.errors.set(errors);
		}
	};

	post() {
		return this.submit("post");
	};

	delete() {
		return this.submit("delete");
	};

	put() {
		return this.submit("put");
	};
}

module.exports = FormSpine;