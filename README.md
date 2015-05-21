# Hypercube

Build submission server for Cordwood builds

There is one route `/upload` which expects:
  - One `js` field with a JavaScript file
  - One `css` field with a CSS file
  - A `commit` field with a commit hash to uniquely identify the current state of the build
  - Either a `pr` field with a pull request number _or_ a `branch` field with a branch name

The request should be submitted as `multipart/form-data` with the `POST` verb.

When an `/upload` request succeeds, the `app.js`, `app.css`, and `version.json` files are written to the directory specified in `config.js`(you can base yours on `config.js.example`).
The `version.json` file is automatically populated with the `commit` field in the `version` property of its root object, where Cordwood will read the build's unique identifier from.

If you want to expose the `/uploads` directory, configure NGINX with a `location` block pointing to your `/uploads` directory, and be sure to add Content-Security-Policy headers, using a configuration directive like:
```
add_header Content-Security-Policy
  "default-src 'self';
  script-src 'unsafe-inline' 'unsafe-eval';
  style-src 'unsafe-inline' ;
  connect-src *;";
```
