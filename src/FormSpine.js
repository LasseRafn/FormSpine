var Validator = require('./Validator');
var ErrorBag = require('./ErrorBag');

import fetch from "unfetch";

class FormSpine {
	constructor(url, fields, customErrorMessages, clearOnSuccess) {
		this.errors = new ErrorBag;
		this.setupFields(fields);
		this.url = url;
		this.validator = new Validator(customErrorMessages);
		this.clearOnSuccess = clearOnSuccess !== undefined ? clearOnSuccess : false;
	}

	setupFields(fields) {
		this.fields = {};
		this.originalValues = {};

		for (let field in fields) {
			fields[field]["value"] = fields[field].value ? fields[field].value : "";
			fields[field]["name"] = fields[field].name ? fields[field].name : field;

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
				headers: {
					'Content-Type': 'application/json'
				},
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
		if (this.clearOnSuccess) {
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