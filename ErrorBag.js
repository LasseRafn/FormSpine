class ErrorBag {
  constructor() {
    this.errors = {};
  }
  
  count() {
    return Object.keys(this.errors).length;
  };
  has(field) {
    return this.errors.hasOwnProperty(field);
  }
  get(field) {
    return this.errors.hasOwnProperty(field) ? this.errors[field] : [];
  }
  first(field) {
    const errors = this.get(field);
    return errors.length > 0 ? errors[0] : false;
  }
  set(errors) {
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

module.export = ErrorBag;
