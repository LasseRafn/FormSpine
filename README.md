<p align="center" style="text-align: center;">
<a href="http://lasserafn.github.io/formspine/"><img src="https://cdn.rawgit.com/LasseRafn/formspine/34b626b0/logo.svg" width="502" height="112" alt="FormSpine Logo" /></a>
</p>

<p align="center" style="text-align: center;">
<a href="https://codecov.io/gh/LasseRafn/FormSpine"><img src="https://img.shields.io/codecov/c/github/LasseRafn/FormSpine.svg?style=flat-square" /></a>
<a href="https://travis-ci.org/LasseRafn/FormSpine"><img src="https://img.shields.io/travis/LasseRafn/FormSpine.svg?style=flat-square" /></a>
<a href="http://npmjs.com/package/formspine"><img src="https://img.shields.io/npm/v/formspine.svg?style=flat-square" /></a>
<a href="http://npmjs.com/package/formspine"><img src="https://img.shields.io/npm/dt/formspine.svg?style=flat-square" /></a>
</p>

# FormSpine

FormSpine is a lightweight (`~4kb`, ~1.2kb gzipped) JavaScript form library with validation, error handling and fetch (Polyfilled with [developit/unfetch](https://github.com/developit/unfetch))

It's promise-based, which makes running scripts on error/success very easy.

------------------------------------------------

## Table of Contents

* [Getting Started](#getting-started)
* [Usage](#usage)
* [API](#api)
* [Examples](#examples)
* [SlimSpine](#slimspine)
* [Inspiration](#inspiration)

------------------------------------------------

## Getting Started

### Install Instructions

Adding FormSpine to your project requires NPM. Optinally you could use [Yarn](https://yarnpkg.com).

Run the following command in your project root:
```bash
npm install formspine --save
```

Or with Yarn:
```bash
yarn add formspine
```

### Using In Your Project

Using Rollup or WebPack (or another module bundler), you can do like this: 
```js
// ES6
import FormSpine from "formspine";

// CommonJS
var FormSpine = require("formspine");
```

#### Remember to polyfill `Fetch`
```js
require("unfetch/polyfill");
```

#### It's also on unpkg:
```html
<script src="//unpkg.com/formspine/dist/formspine.umd.js"></script>

<script>
var FormSpine = formspine; // to fix name in UMD package, for consistency.

new FormSpine('/', {});
</script>
```
_Please notice that the `fetch` polyfill is **NOT** included in the UMD version._
 
------------------------------------------------

## Usage

### Vue.js example
```js
let fields = {
    todo_text: {
        required: true,
        max_length: 50
    }
};

new Vue({
    el: "#app",
    data: {
        form: new FormSpine('/create-todo', fields)
    },
    
    methods: {
        submit: function() {
            this.form.post().then(() => alert('Done!'));
        }
    }
});
```

------------------------------------------------

## API

### The `FormSpine` Class

The `FormSpine` class is the backbone of FormSpine and the class you'll be using.

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
| `options` | object | An object with additional options | false | `{}` |

##### FormSpine `options` parameters

| Name | Type | Description | Required | Default |
| ---- |----- | ----------- |--------- | ------- |
| `messages` | object | Custom error validation messages. | false | `{}` |
| `resetOnSuccess` | boolean | Determines if form fields should be cleared on success. | false | false |
| `headers` | object | Adds custom headers to each request | false | `{}` |

##### `url` [REQUIRED]

The `url` parameter is the first of three parameters, and it defines which url to send requests to upon submitting. It can be an absolute or relative url, such as: `/submit` or `https://your-site.com/send`.

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
| `value` | string | The initial value of the field | `''` |
| `name` | string | The field name used in error messages (:field) | object key name |
| `required` | boolean | Validation rule: determines if field is required | `false` |
| `min_length` | integer | Validation rule: sets a minimum length for the field | |
| `max_length` | integer | Validation rule: sets a maximum length for the field |  |
| `no_digits` | boolean | Validation rule: may not contain digits | `false` |
| `only_digits` | boolean | Validation rule: may only contain digits | `false` |
| `checked` | boolean | Validation rule: has to be checked / be `true` (for checkbox/radio inputs) | `false` |
| `must_match` | string | Validation rule: has to match another field (good for password confirmations) | `` |
| `regex` | string/regex | Validation rule: must match regex |  |

##### `customMessages` [OPTIONAL]

This parameter is useful if you want to translate or change the validation messages. You have to pass in an object of strings with error messages.

**Example (Using defaults):**
```js
let customMessages = {
    checked:      "The :field must be checked.",
    regex:        "The :field field is invalid.",
    required:     "The :field field is required.",
    no_digits:    "The :field field may not contain digits.",
    only_digits:  "The :field field may only contain digits.",
    must_match:   "The :field field match the :must_match field.",
    min_length:   "The :field field must be at least :min_length characters.",
    max_length:   "The :field field must not be longer than :max_length characters."
};

// Init form
let formObject = new FormSpine('/submit', {}, { messages: customMessages });
```

------------------------------------------------

## Examples

[Vue Demo](http://codepen.io/LasseRafn/pen/RpJMLY/)
[Preact Demo](http://codepen.io/LasseRafn/pen/qrKMgG/)

------------------------------------------------

## SlimSpine

Don't care about client-side validation, and does every byte count? How about using **SlimSpine**?

It's a `~0.9kb` version of FormSpine, without the Validation library. It still handles errors, but will not validate fields.

[Get SlimSpine here](#) <-- COMING SOON

------------------------------------------------

## Inspiration
I found myself creating similar classes for every new project I started, so I felt it was time to combine everything into a single class that I could use for almost all my projects. Of cause, in the nature of sharing, I decided to open source it.

FormSpine is inspired heavily on [laracasts/vue-forms](https://github.com/laracasts/Vue-Forms)

If you're into learning, you should really go signup at [Laracasts](https://laracasts.com)

Build scripts (and more) are heavily based on [developit/unfetch](https://github.com/developit/unfetch). 
