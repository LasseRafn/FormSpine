class Validator {
	constructor(customMessages) {
		this.messages = {
			regex: "The :field field is invalid.",
			required: "The :field field is required.",
			no_digits: "The :field field may not contain digits.",
			only_digits: "The :field field may only contain digits.",
			must_match: "The :field field match the :must_match field.",
			min_length: "The :field field must be at least :min_length characters.",
			max_length: "The :field field must not be longer than :max_length characters."
		};

		if (customMessages !== undefined) {
			for (let message in customMessages) {
				this.messages[message] = customMessages[message];
			}
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
				must_match: field.must_match
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
