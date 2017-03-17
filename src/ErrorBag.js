class Demo {

}

function ErrorBag() {
	this.count = function () {
		return Object.keys(this.errors).length;
	};

	this.has = function (field) {
		if(field === undefined)
		{
			return false;
		}

		return this.errors[field] !== undefined;
	};

	this.get = function (field) {
		if(field === undefined)
		{
			return [];
		}

		return this.errors[field] !== undefined ? this.errors[field] : [];
	};

	this.first = function (field) {
		var errors = this.get(field);

		return errors.length > 0 ? errors[0] : false;
	};

	this.set = function (errors) {
		for(var error in errors) {
			if(typeof errors[error] === "string") {
				errors[error] = [errors[error]];
			}
		}

		this.errors = errors;
	};

	this.clear = function (field) {
		if (field) {
			delete this.errors[field];
			return;
		}

		this.errors = {};
	};

	this.errors = {};
}

module.exports = ErrorBag;