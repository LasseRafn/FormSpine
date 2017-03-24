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

export default {ErrorBag};
export {ErrorBag};