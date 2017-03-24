const ErrorBag = require("./ErrorBag");
const Validator = require("./Validator");

class FormSpine {
	constructor(url, fields, options) {
		this.options = options || {};
		this.errors = new ErrorBag;
		this.setupFields(fields);
		this.url = url;
		this.headers = {'Content-Type': 'application/json'};
		this.resetOnSuccess = this.options.resetOnSuccess || false;
		this.validator = new Validator(this.options.messages || {});
		this.headers = Object.assign(this.headers, this.options['headers'] || {});
	}

	setupFields(fields) {
		this.fields = {};
		this.originalValues = {};

		for (let field in fields) {
			fields[field].value = fields[field].value || "";
			fields[field].name = fields[field].name || field;

			this.fields[field] = fields[field];
			this.originalValues[field] = this.fields[field].value;
		}
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
		const self = this;
		self.errors.clear();

		return new Promise(function (resolve, reject) {
				const validationResponse = self.validator.validate(self.fields);

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
					response.json().then(function (data) {
						if (response.ok) {
							self.onSuccess(data);
							resolve(data);
						} else {
							self.onFail(data);
							reject(data);
						}
					}).catch(function () {
						response.text().then(function (data) {
							if (response.ok) {
								self.onSuccess(data);
								resolve(data);
							} else {
								self.onFail(data);
								reject(data);
							}
						});
					});
				});
			}
		);
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