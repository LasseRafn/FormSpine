var Validator = require('./Validator');
var ErrorBag = require('./ErrorBag');
var fetch = require('unfetch');

function FormSpine(url, fields, customErrorMessages, clearOnSuccess) {
	this.setupFields = function (fields) {
		this.fields = {};
		this.originalValues = {};
		for (var field in fields) {
			fields[field]["value"] = fields[field].value ? fields[field].value : "";
			fields[field]["name"] = field;

			this.fields[field] = fields[field];
			this.originalValues[field] = this.fields[field].value;
		}
	};

	this.validate = function () {
		this.errors.clear();

		return this.validator.validate(this.fields);
	};

	this.data = function () {
		var formData = {};
		for (var field in this.fields) {
			formData[field] = this.fields[field].value;
		}
		return formData;
	};

	this.clear = function () {
		for (var field in this.fields) {
			this.fields[field].value = "";
		}
		this.errors.clear();
	};

	this.reset = function () {
		for (var field in this.fields) {
			this.fields[field].value = this.originalValues[field];
		}
		this.errors.clear();
	};

	this.submit = function (method) {
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
					return Promise.reject(response.json());
				}
			}).then(function (response) {
				self.onSuccess(response.json());
				resolve(response.json());
			}).catch(function(response)
			{
				var responseError = "";

				if (response.json() !== undefined) {
					responseError = response.json();
				} else {
					responseError = response.responseText;
				}

				self.onFail(responseError);
				reject(responseError);

				return false;
			});
		});
	};

	this.onSuccess = function (data) {
		if (this.clearOnSuccess) {
			this.reset();
		}
	};

	this.onFail = function (errors) {
		if (typeof errors === "string") {
			errors = {
				general: [errors]
			};
		}
		this.errors.set(errors);
	};

	this.post = function () {
		return this.submit("post");
	};

	this.delete = function () {
		return this.submit("delete");
	};

	this.put = function () {
		return this.submit("put");
	};

	this.errors = new ErrorBag;
	this.setupFields(fields);
	this.url = url;
	this.validator = new Validator(customErrorMessages);
	this.clearOnSuccess = clearOnSuccess !== undefined ? clearOnSuccess : false;
}

module.exports = FormSpine;