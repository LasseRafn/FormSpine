export default function ErrorBag() {
	this.errors = {};

	this.count = function () {
		return Object.keys(this.errors).length;
	};

	this.has = function (field) {
		return this.errors.hasOwnProperty(field);
	};

	this.get = function (field) {
		return this.errors.hasOwnProperty(field) ? this.errors[field] : [];
	};

	this.first = function (field) {
		const errors = this.get(field);
		return errors.length > 0 ? errors[0] : false;
	};

	this.set = function (errors) {
		this.errors = errors;
	};

	this.clear = function (field) {
		if (field) {
			delete this.errors[field];
			return;
		}
		this.errors = {};
	};
}