# gridsome-plugin-htaccess

Generates a .htaccess file at build time according to your options and save it at the root of your dist folder.

[![npm](https://img.shields.io/npm/v/gridsome-plugin-htaccess)](https://www.npmjs.com/package/gridsome-plugin-htaccess) [![npm peer dependency version](https://img.shields.io/npm/dependency-version/gridsome-plugin-htaccess/peer/gridsome)](https://www.npmjs.com/package/gridsome) ![NPM](https://img.shields.io/npm/l/gridsome-plugin-htaccess) [![Build Status](https://travis-ci.com/khalyomede/gridsome-plugin-htaccess.svg?branch=master)](https://travis-ci.com/khalyomede/gridsome-plugin-htaccess) [![codecov](https://codecov.io/gh/khalyomede/gridsome-plugin-htaccess/branch/master/graph/badge.svg)](https://codecov.io/gh/khalyomede/gridsome-plugin-htaccess) [![Maintainability](https://api.codeclimate.com/v1/badges/8ff55034cb48484f551c/maintainability)](https://codeclimate.com/github/khalyomede/gridsome-plugin-htaccess/maintainability) ![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/gridsome-plugin-htaccess) ![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/gridsome-plugin-htaccess)

## Summary

- [About](#about)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Examples](#examples)
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

## Examples

- [1. Blocking IPs](#1-blocking-ip)
- [2. Blocking user agents](#2-blocking-user-agents)
- [3. Adding Content security policies](#3-adding-content-security-policies)
- [4. Adding custom content](#4-adding-custom-content)
- [5. Adding custom headers](#5-adding-custom-headers)
- [6. Disabling directory index](#6-disabling-directory-index)
- [7. Preventing the server from sending its signature](#7-Preventing-the-server-from-sending-its-signature)
- [8. Adding Feature policies](#8-adding-feature-policies)
- [9. Adding custom file expirations](#9-adding-custom-file-expirations)
- [10. Adding a default file expirations for all the file types](#10-adding-a-default-file-expirations-for-all-the-file-types)
- [11. Force HTTPS](#11-force-https)
- [12. Prevent files from being cached by the browser](#12-prevent-files-from-being-cached-by-the-browser)
- [13. Prevent from being able to ping your server](#13-prevent-from-being-able-to-ping-your-server)
- [14. Prevent DDoS attacks by limiting the size of the downloaded files](#14-prevent-ddos-attacks-by-limiting-the-size-of-the-downloaded-files)
- [15. Prevent script injection in the URL](#15-prevent-script-injection-in-the-url)
- [16. Setting up redirections](#16-setting-up-redirections)
- [17. Enabling text compression by file type](#17-enabling-text-compression-by-file-type)

### 1. Blocking IPs

```javascript
// gridsome.config.js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-htaccess",
      options: {
        blockedIp: ["192.168.0.1", "8.8.4.4"],
      },
    },
  ],
};
```

### 2. Blocking user agents

```javascript
// gridsome.config.js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-htaccess",
      options: {
        blockedUserAgents: ["googlebot", "yandexbot", "bingbot"],
      },
    },
  ],
};
```

### 3. Adding Content security policies

```javascript
// gridsome.config.js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-htaccess",
      options: {
        contentSecurityPolicy: {
          "frame-src": ["self", "youtube.com"],
          "script-src": ["self"],
          "font-src": ["fonts.google.com"],
        },
      },
    },
  ],
};
```

### 4. Adding custom content

```javascript
// gridsome.config.js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-htaccess",
      options: {
        customcontent: {
          order: "after",
          content: "SSLProtocol -ALL +TLSv1.2",
        },
      },
    },
  ],
};
```

### 5. Adding custom headers

```javascript
// gridsome.config.js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-htaccess",
      options: {
        customHeaders: {
          "X-Powered-By": "Gridsome 0.7.12",
        },
      },
    },
  ],
};
```

### 6. Disabling directory index

```javascript
// gridsome.config.js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-htaccess",
      options: {
        disableDirectoryIndex: true,
      },
    },
  ],
};
```

### 7. Preventing the server from sending its signature

```javascript
// gridsome.config.js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-htaccess",
      options: {
        disableServerSignature: true,
      },
    },
  ],
};
```

### 8. Adding Feature policies

```javascript
// gridsome.config.js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-htaccess",
      options: {
        featurePolicy: {
          geolocation: ["none"],
          battery: ["self"],
          "ambient-light-sensor": ["self", "amazon.com"],
        },
      },
    },
  ],
};
```

### 9. Adding custom file expirations

```javascript
// gridsome.config.js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-htaccess",
      options: {
        fileExpirations: {
          fileTypes: {
            "text/html": "access plus 1 day",
            "image/png": "access plus 1 week",
          },
        },
      },
    },
  ],
};
```

### 10. Adding a default file expirations for all the file types

```javascript
// gridsome.config.js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-htaccess",
      options: {
        fileExpirations: {
          default: "access plus 1 month",
        },
      },
    },
  ],
};
```

### 11. Force HTTPS

```javascript
// gridsome.config.js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-htaccess",
      options: {
        forceHttps: true,
      },
    },
  ],
};
```

### 12. Prevent files from being cached by the browser

```javascript
// gridsome.config.js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-htaccess",
      options: {
        notCachedFiles: ["/service-worker.js", "/assets/js/service-worker.js"],
      },
    },
  ],
};
```

### 13. Prevent from being able to ping your server

```javascript
// gridsome.config.js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-htaccess",
      options: {
        pingable: false,
      },
    },
  ],
};
```

### 14. Prevent DDoS attacks by limiting the size of the downloaded files

```javascript
// gridsome.config.js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-htaccess",
      options: {
        preventDdosAttacks: {
          downloadedFilesSizeLimit: 102400, // in bytes
        },
      },
    },
  ],
};
```

### 15. Prevent script injection in the URL

```javascript
// gridsome.config.js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-htaccess",
      options: {
        preventScriptInjection: true,
      },
    },
  ],
};
```

### 16. Setting up redirections

```javascript
// gridsome.config.js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-htaccess",
      options: {
        redirections: [
          {
            from: "/about",
            to: "/about-us",
          },
          {
            from: "/webp",
            to: "https://dev.to/webp",
          },
        ],
      },
    },
  ],
};
```

### 17. Enabling text compression by file type

```javascript
// gridsome.config.js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-htaccess",
      options: {
        textCompression: [
          "text/html",
          "application/javascript",
          "text/css",
          "image/png",
        ],
      },
    },
  ],
};
```

## API

_You will find the types of the complex types right below this list._
_Options specified with the "?:" means non mandatory keys_.

- options
  - **blockedIp**: `Array<string>` A list of IP to block from being able to browser your web app. [Order Apache documentation](https://httpd.apache.org/docs/2.4/en/mod/mod_access_compat.html#order).
  - **blockedUserAgents**: `Array<string>` A list of user agents you want to prevent from accessing your server files, to save your server resources for example.
  - **contentSecurityPolicy**: `ContentSecurityPolicy` A set of key-value pairs that holds your content security policies. You do not need to single-quote the following values (this is done for you): `none`, `src`, `self`, `unsafe-eval`, `unsafe-hashes`, `unsafe-inline`, `strict-dynamic` and `report-sample`. [Content-SecurityPolicy MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy).
  - **customContent**?: `CustomContent` Some custom content to append or prerend to the generated htaccess content.
  - **customHeaders**: `CustomHeaders` A set of key-value pairs to add custom headers to each responses. [Headers Apache documentation](https://httpd.apache.org/docs/current/en/mod/mod_headers.html).
  - **disableDirectoryIndex**: `Boolean` If set to true, will add a rule to disable the directory index. [Directory index Apache documentation](https://httpd.apache.org/docs/2.4/en/mod/mod_dir.html#directoryindex).
  - **disableServerSignature**: `Boolean` If set to true, will add a rule to prevent sending the server signature in each responses. [Server signature Apache documentation](https://httpd.apache.org/docs/2.4/en/mod/core.html#serversignature).
  - **featurePolicy**: `FeaturePolicy` A set of key-value pairs holding your feature policies. [Feature-Policy MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy).
  - **fileExpirations**: `FileExpirations` An object that let you control how your file types should be cached by the browser. You can also set a default file cache. [ExpiresByType Apache documentation](https://httpd.apache.org/docs/2.4/en/mod/mod_expires.html#expiresbytype).
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

interface CustomHeaders {
  [key: string]: string;
}

interface FileExpirations {
  default?: string;
  fileTypes?: FileType;
}

interface FileType {
  [key: string]: string;
}
```
