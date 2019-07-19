# bsd-node

NodeJS Library for interacting with the BSD Tools.

## Setup

```sh
$ npm install @ewarren/bsd-node
```

## Usage

**Convert a two-letter code to the name of a state**

```js
const bsd = require('@ewarren/bsd-node');

const bsdClient = bsd('client.bsd.net', 'your_app_id', 'your_app_secret');

const response = await client.get('/page/api/signup/list_form_fields', {
  'signup_form_id': '123',
});

console.log(response.statusCode);
console.log(response.data.api.signup_form_field);
```

## Local development

Coming soon...
