import ErrorBag from "./ErrorBag";
import Validator from "./Validator";

class FormSpine {
	constructor(url, fields, options) {
		this.setOptions(options || {});
		this.errors = new ErrorBag;
		this.setupFields(fields);
		this.setUrl(url);
		this.setHeaders({'Content-Type': 'application/json'});
		this.setResetOnSuccess(this.options.resetOnSuccess || false);
		this.validator = new Validator(this.options.messages || {});
	}

	setUrl(url) {
		this.url = url;
	}

	setHeaders(headers) {
		this.headers = headers;
		this.headers = Object.assign(this.headers, this.options['headers'] || {});
	}

	setOptions(options) {
		this.options = options;
	}

	setResetOnSuccess(resetOnSuccess) {
		this.resetOnSuccess = resetOnSuccess;
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

	validate(field) {
		if (field) {
			return this.validator.validate([this.fields[field]]);
		}

		return this.validator.validate(this.fields);
	}

	submit(method) {
		const self = this;
		self.errors.clear();

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

export default FormSpine;