const ErrorBag = require("./ErrorBag");
const Validator = require("./Validator");

class FormSpine {
	constructor(url, fields, options) {
		this.options = options || {messages: {}, resetOnSuccess: false};
		this.errors = new ErrorBag;
		this.setupFields(fields);
		this.url = url;
		this.headers = {'Content-Type': 'application/json'};

		this.resetOnSuccess = this.options['resetOnSuccess'] !== undefined ? this.options.resetOnSuccess : false;
		this.validator = new Validator(this.options['messages'] !== undefined ? this.options.messages : {});

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