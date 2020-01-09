# gridsome-plugin-htaccess

Generates a .htaccess file at build time according to your options and save it at the root of your dist folder.

[![npm](https://img.shields.io/npm/v/gridsome-plugin-htaccess)](https://www.npmjs.com/package/gridsome-plugin-htaccess) [![npm peer dependency version](https://img.shields.io/npm/dependency-version/gridsome-plugin-htaccess/peer/gridsome)](https://www.npmjs.com/package/gridsome) ![NPM](https://img.shields.io/npm/l/gridsome-plugin-htaccess) [![Build Status](https://travis-ci.com/khalyomede/gridsome-plugin-htaccess.svg?branch=master)](https://travis-ci.com/khalyomede/gridsome-plugin-htaccess) [![codecov](https://codecov.io/gh/khalyomede/gridsome-plugin-htaccess/branch/master/graph/badge.svg)](https://codecov.io/gh/khalyomede/gridsome-plugin-htaccess) [![Maintainability](https://api.codeclimate.com/v1/badges/8ff55034cb48484f551c/maintainability)](https://codeclimate.com/github/khalyomede/gridsome-plugin-htaccess/maintainability) ![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/gridsome-plugin-htaccess) ![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/gridsome-plugin-htaccess)

## Summary

- [About](#about)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Changelog](CHANGELOG.md)

## About

I made this plugin because I am using Gridsome to build a static website that I host on an host provider that runs an Apache server.

I needed a reliable and flexible way to generate my `.htaccess` without having to worry about typos or boilerplate syntaxes.

## Features

- Generates a `.htaccess` file at the root of your `dist` file
- Supports the following options:
  - Security
    - Feature-Policy header
    - Content-Security-Policy header
    - Preventing script injection
    - Preventing image hotlinking (WIP)
    - Preventing Ddos Attacks by limiting the file size downloaded
    - Disable being able to ping your domain
    - IP blocking
    - Disabling the directory index
    - Hiding the server signature
    - Forcing HTTPS
    - Blocking user agents
  - Performance
    - Enabling text compression for the MIME type of your choice
  - Misc
    - Preventing the browser from caching the files of your choice
    - 301 redirections
    - Control on the files expirations
    - Adding custom headers
- Let you merge a custom `.htaccess-custom` at the start or the end of the generated `.htaccess` when you cannot find enough flexibility with the available options

## Requirements

Gridsome installed (version 0.\*).

## Installation

With NPM:

```bash
npm install --save-dev gridsome-plugin-htaccess
```

With Yarn:

```bash
yarn add --dev gridsome-plugin-htaccess
```

## Usage

In your file `gridsome.config.js`, add the `gridsome-plugin-htaccess` plugin in your `plugins`.

```javascript
module.exports = {
  siteName: "Gridsome",
  plugins: [
    {
      use: "gridsome-plugin-htaccess",
    },
  ],
};
```

Add an example option (enabling GZIP compression for HTML files).

```javascript
module.exports = {
  siteName: "Gridsome",
  plugins: [
    {
      use: "gridsome-plugin-htaccess",
      options: {
        textCompression: ["text/html"],
      },
    },
  ],
};
```

Build your project.

```bash
gridsome build
```

You should see something like this in your terminal.

```
$ gridsome build
Gridsome v0.7.12

Initializing plugins...
Load sources - 0s
Create GraphQL schema - 0.02s
Create pages and templates - 0.03s
Generate temporary code - 0.05s
Bootstrap finish - 0.95s
gridsome-plugin-htaccess: 0.613ms <---------
Compile assets - 4.34s
Execute GraphQL (3 queries) - 0s
Write out page data (3 files) - 0.01s
Render HTML (3 files) - 0.3s
Process files (0 files) - 0s
Process images (9 images) - 0.79s


  Done in 6.49s
```

Now check on the `.htaccess` file in your `dist` folder. You should see this content.

```xml
# Enable text compression
<IfModule mod_deflate.c>
	AddOutputFilterByType DEFLATE text/html
</IfModule>
```

## API

_You will find the types of the complex types right below this list._
_Options specified with the "?:" means non mandatory keys_.

- options
  - **blockedIp**: `Array<string>` A list of IP to block from being able to browser your web app. [Order Apache documentation](https://httpd.apache.org/docs/2.4/en/mod/mod_access_compat.html#order).
  - **blockedUserAgents**: `Array<string>` A list of user agents you want to prevent from accessing your server files, to save your server resources for example.
  - **contentSecurityPolicy**: `ContentSecurityPolicy` A set of key-value pairs that holds your content security policies. [Content-SecurityPolicy MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy).
  - **customContent**?: `CustomContent` Some custom content to append or prerend to the generated htaccess content.
  - **customHeaders**: `CustomHeaders` A set of key-value pairs to add custom headers to each responses. [Headers Apache documentation](https://httpd.apache.org/docs/current/en/mod/mod_headers.html).
  - **disableDirectoryIndex**: `Boolean` If set to true, will add a rule to disable the directory index. [Directory index Apache documentation](https://httpd.apache.org/docs/2.4/en/mod/mod_dir.html#directoryindex).
  - **disableServerSignature**: `Boolean` If set to true, will add a rule to prevent sending the server signature in each responses. [Server signature Apache documentation](https://httpd.apache.org/docs/2.4/en/mod/core.html#serversignature).
  - **featurePolicy**: `FeaturePolicy` A set of key-value pairs holding your feature policies. [Feature-Policy MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy).
  - **forceHttps**: `Boolean` If set to true, will add a rule to force your users' browser to go to the HTTPS version of your web app.
  - **notCachedFiles**: `Array<string>` A list of file paths that you want to prevent from being cached by your users' browser.
  - **pingable**: `Boolean` If set to true, will add a rule to prevent to ping your domain.
  - **preventDdosAttacks**?: `DdosAttackPreventionOption` An object you can specify to tell how many bytes maximum your browser should request.
  - **preventScriptInjection**: `Boolean` If set to true, will add a rule to prevent scripts injections in the URL.
  - **redirections**: `Array<Redirection>` An array of objects to specify 301 redirections. [Redirect Apache documentation](https://httpd.apache.org/docs/2.4/en/rewrite/avoid.html#redirect)
  - **textCompression**: `Array<string>` An array of MIME types you want your server to compress before sending its content to the browser. [Deflate Apache documentation](https://httpd.apache.org/docs/2.4/en/mod/mod_deflate.html#enable).

```typescript
interface ContentSecurityPolicy {
  [key: string]: Array<string>;
}

interface FeaturePolicy {
  [key: string]: Array<string>;
}

interface Redirection {
  from: string;
  to: string;
}

interface DdosAttackPreventionOption {
  downloadedFilesSizeLimit: number;
}

interface CustomContent {
  order: "before" | "after";
  content: string;
}
```
