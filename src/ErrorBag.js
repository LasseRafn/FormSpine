class ErrorBag {
	constructor() {
		this.errors = {};
	};

	count() {
		return Object.keys(this.errors).length;
	};

	has(field) {
		if (field === undefined) {
			return false;
		}

		return this.errors[field] !== undefined;
	};

	get(field) {
		if (field === undefined) {
			return [];
		}

		return this.errors[field] !== undefined ? this.errors[field] : [];
	};

	first(field) {
		var errors = this.get(field);

		return errors.length > 0 ? errors[0] : false;
	};

	set(errors) {
		for (var error in errors) {
			if (typeof errors[error] === "string") {
				errors[error] = [errors[error]];
			}
		}

		this.errors = errors;
	};

	clear(field) {
		if (field) {
			delete this.errors[field];
			return;
		}

		this.errors = {};
	};
}

module.exports = ErrorBag;