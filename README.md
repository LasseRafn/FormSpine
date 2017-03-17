<p align="center" style="text-align: center;">
<a href="http://lasserafn.github.io/form-spine/"><img src="https://cdn.rawgit.com/LasseRafn/form-spine/c6906cf4/logo.svg" width="508" height="112" alt="Form Spine Logo" /></a>
</p>

<p align="center" style="text-align: center;">
<a href="http://npmjs.com/package/form-spine"><img src="https://img.shields.io/npm/v/form-spine.svg" /></a>
<a href="http://npmjs.com/package/form-spine"><img src="https://img.shields.io/npm/dt/form-spine.svg" /></a>
</p>
    
Form Spine is a lightweight (`~4kb`, ~1.2kb gzipped) JavaScript form library with validation, error handling and ajax requests (based on [unfetch](https://github.com/developit/unfetch))

It's promise-based, which makes running scripts on error/success very easy.

**Want to see it in action? [Click here](#)**

## Getting Started

### Adding To Your Project

Adding Form Spine to your project requires NPM. Optinally you could use [Yarn](https://yarnpkg.com).

Run the following command in your project root:
```bash
npm install form-spine --save
```

Or with Yarn:
```bash
yarn add form-spine
```

### Using In Your Project

To use Form Spine in your project, you must require it, like this:

```js
const FormSpine = require("form-spine");
```

## Usage

### Vue.js example
```js
const FormSpine = require("form-spine");

let formFields = {
    todo_text: {
        required: true,
        max_length: 50
    }
};

new Vue({
    el: "#app",
    data: {
        form: new FormSpine('/create-todo', formFields);
    },
    
    methods: {
        submit: function() {
            this.form.post().then(() => alert('Done!'));
        }
    }
});
```

## Documentation

### The `FormSpine` Class

The `FormSpine` class is the backbone of Form Spine and the class you'll be using.

#### Methods

| Method | Description | Parameters |
| ------ | ----------- | ---------- |
| `post` | Sends a `POST` request to the url specified in the Form object |  |
| `delete` | Sends a `DELETE`/`DESTROY` request to the url specified in the Form object |  |
| `put` | Sends a `PUT` request to the url specified in the Form object |  |
| `submit` | Sends a request with the `type` specified, to the url specified in the Form object | `type`: Any request type possible in the fetch api. Example: `form.submit('GET')` |

#### Parameters

| Name | Type | Description | Required | Default |
| ---- |----- | ----------- |--------- | ------- |
| `url` | string | The url that requests should be send to. | true | `''` |
| `fields` | object | The fields in the form. | true | `{}` |
| `customErrorMessages` | object | Custom validation messages. | false | `{}` |
| `clearOnSuccess` | boolean | Determines if form fields should be cleared on success. | false | false |

##### `url` [REQUIRED]

The `url` parameter is the first of three parameters, and it defines which url to send requests to upon `submit()`. It can be an absolute or relative url, such as: `/submit` or `https://your-site.com/send`.

##### `fields` [REQUIRED]

The fields that you have in the form should be defined here as an object of objects, keyed by field name. This is also where you define validation rules (if any)

**Example:**
```js
let fields = {
    username: {
        required: true
    },
    
    password: {
        required: true,
        min_length: 6,
        must_match: "password_confirmation"
    },
    
    password_confirmation: {
        required: true
    }
};

// Init form
let formObject = new FormSpine('/submit', fields);
```

**Possible field attributes are:**

| Name | Type | Description | Default |
| ---- | ---- | ----------- | ------- |
| `value` | string | The initial value | `''` |
| `required` | boolean | Validation rule: determines if field is required | `false` |
| `min_length` | integer | Validation rule: sets a minimum length for the field | |
| `max_length` | integer | Validation rule: sets a maximum length for the field |  |
| `no_digits` | boolean | Validation rule: may not contain digits | `false` |
| `only_digits` | boolean | Validation rule: may only contain digits | `false` |
| `regex` | string/regex | Validation rule: must match regex |  |

##### `customMessages` [OPTIONAL]

This parameter is useful if you want to translate or change the validation messages. You have to pass in an object of strings with error messages.

**Example:**
```js
let customMessages = {
    regex:        "The :field field is invalid.",
    required:     "The :field field is required.",
    no_digits:    "The :field field may not contain digits.",
    only_digits:  "The :field field may only contain digits.",
    must_match:   "The :field field match the :must_match field.",
    min_length:   "The :field field must be at least :min_length characters.",
    max_length:   "The :field field must not be longer than :max_length characters."
};

// Init form
let formObject = new FormSpine('/submit', {}, customMessages);
```

## Inspiration
Form Spine is inspired heavily on [laracasts/vue-forms](https://github.com/laracasts/Vue-Forms)

If you're into learning, you should really go signup at [Laracasts](https://laracasts.com)

(I'm in no way affiliated or sponsored by Laracasts!)

## Motivation
I found myself creating similar classes for every new project I started, so I felt it was time to combine everything into a single class that I could use for almost all my projects. Of cause, in the nature of sharing, I decided to open source it.
