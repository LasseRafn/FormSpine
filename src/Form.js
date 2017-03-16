const Validator = require('./Validator');
const ErrorBag = require('./ErrorBag');
const fetch = require('unfetch');

class Form {
  constructor(url, fields, customErrorMessages, clearOnSuccess) {
    this.errors = new ErrorBag;
    this.setupFields(fields);
    this.url = url;
    this.validator = new Validator(customErrorMessages);
    this.clearOnSuccess = clearOnSuccess !== undefined ? clearOnSuccess : false;
  }
  setupFields(fields) {
    this.fields = {};
    this.originalValues = {};
    for (let field in fields) {
      fields[field]["value"] = fields[field].value ? fields[field].value : "";
      fields[field]["name"] = field;
      
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
    return new Promise((resolve, reject) => {
      const validationResponse = this.validate();
      
      if( Object.keys(validationResponse).length > 0 ) {
        this.errors.set(validationResponse);
        reject(validationResponse);
        
        return false;
      }
      axios[method](this.url, this.data()).then(response => {
        this.onSuccess(response.data);
        resolve(response.data);
        
        return true;
      }).catch((error) => {
        let responseError = "";
        if (error.response !== undefined && error.response.data !== undefined && typeof error.response.data === "object") {
          responseError = error.response.data;
        } else {
          responseError = error.response.statusText;
        }
        this.onFail(responseError);
        reject(responseError);
        
        return false;
      });
    });
  }
  onSuccess(data) {
    if(this.clearOnSuccess) {
      this.reset();
    }
  }
  onFail(errors) {
    if (typeof errors === "string") {
      errors = {
        general: [errors]
      };
    }
    this.errors.set(errors);
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

module.exports = Form;

module.exports.default = Form;
