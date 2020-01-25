import "mocha-sinon";
import { expect } from "chai";
import GridsomeServer from "../gridsome.server";
import { mkdirSync, unlinkSync, rmdirSync, readFileSync, existsSync } from "fs";

// Prevent from seeing the time logs in the test logs.
console.time = () => {};
console.timeEnd = () => {};

const api = {
	beforeBuild: callable => callable(),
};

before(() => mkdirSync("./static"));
beforeEach(function() {
	this.sinon.stub(console, "error");
});
after(() => rmdirSync("./static"));
afterEach(() => {
	if (existsSync("./static/.htaccess")) {
		unlinkSync("./static/.htaccess");
	}
});

describe("gridsome.server.js", () => {
	it("should not generate the .htaccess file by default", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
		});

		expect(existsSync("./static/.htaccess")).to.be.false;
	});

	it("should generate the rule that disable directory index if the option is set to true", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			disableDirectoryIndex: true,
		});

		const expected = `# Disable directory index
Options All -Indexes

`;
		const actual = readFileSync("./static/.htaccess").toString();

		expect(actual).to.be.equal(expected);
	});

	it("should add the content before if specified in the options", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			customContent: {
				order: "before",
				content: "foo",
			},
			disableServerSignature: true,
		});

		const expected = `foo

# Prevent your server from sending the version of the server
ServerSignature Off

`;
		const actual = readFileSync("./static/.htaccess").toString();

		expect(actual).to.be.equal(expected);
	});

	it("should add the content after if specified in the options", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			customContent: {
				order: "after",
				content: "foo",
			},
			disableServerSignature: true,
		});

		const expected = `# Prevent your server from sending the version of the server
ServerSignature Off

foo
`;
		const actual = readFileSync("./static/.htaccess").toString();

		expect(actual).to.be.equal(expected);
	});

	it("should generate the rule that prevent the server from sending its signature if the option is set to true", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			disableServerSignature: true,
		});

		const expected = `# Prevent your server from sending the version of the server
ServerSignature Off

`;
		const actual = readFileSync("./static/.htaccess").toString();

		expect(actual).to.be.equal(expected);
	});

	it("should generate the rule that prevent from being able to ping the domain if the option is set to false", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			pingable: false,
		});

		const expected = `# Prevent from being able to ping this domain
RewriteEngine on
RewriteCond %{REQUEST_METHOD} ^(TRACE|TRACK)
RewriteRule .* - [F]

`;
		const actual = readFileSync("./static/.htaccess").toString();

		expect(actual).to.be.equal(expected);
	});

	it("should generate the rule that forces users to pass to HTTPS if the option is set to true", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			forceHttps: true,
		});

		const expected = `# Users' browser will be forced to visit the HTTPS version of your web app
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI} [R,L]
Header set Strict-Transport-Security "max-age=31536000; includeSubDomains"

`;
		const actual = readFileSync("./static/.htaccess").toString();

		expect(actual).to.be.equal(expected);
	});

	it("should generate the rule that enable text compression if the option is filled", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			textCompression: ["text/html", "application/json"],
		});

		const expected = `# Enable text compression
<IfModule mod_deflate.c>
	AddOutputFilterByType DEFLATE text/html
	AddOutputFilterByType DEFLATE application/json
</IfModule>

`;
		const actual = readFileSync("./static/.htaccess").toString();

		expect(actual).to.be.equal(expected);
	});

	it("should generate the redirections if the option is filled", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			redirections: [
				{ from: "/about-me", to: "/about" },
				{ from: "/7-tips-on-laravel-5", to: "/7-tips-on-laravel-6" },
			],
		});

		const expected = `# Permanents redirections (301)
Redirect 301 /about-me /about
Redirect 301 /7-tips-on-laravel-5 /7-tips-on-laravel-6

`;
		const actual = readFileSync("./static/.htaccess").toString();

		expect(actual).to.be.equal(expected);
	});

	it("should generate the rule that prevent script injections if the option is set to true", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			preventScriptInjection: true,
		});

		const expected = `# Preventing script injection
Options + FollowSymLinks
RewriteEngine On
RewriteCond % { QUERY_STRING }(<|% 3C).* script.* (>|% 3E)[NC, OR]
RewriteCond % { QUERY_STRING } GLOBALS(=|[|% [0 - 9A - Z]{ 0, 2})[OR]
RewriteCond % { QUERY_STRING } _REQUEST(=|[|% [0 - 9A - Z]{ 0, 2})
RewriteRule ^ (.*)$ index.html[F, L]

`;
		const actual = readFileSync("./static/.htaccess").toString();

		expect(actual).to.be.equal(expected);
	});

	it("should generate the rule that prevent ddos attack if the option is set to true", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			preventDdosAttacks: {
				downloadedFilesSizeLimit: 8192,
			},
		});

		const expected = `# Preventing DDOS Attacks
LimitRequestBody 8192

`;
		const actual = readFileSync("./static/.htaccess").toString();

		expect(actual).to.be.equal(expected);
	});

	it("should generate custom headers if the option is filled", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			customHeaders: {
				"X-Author": "Elon Musk",
				"X-Generated-By": "Gridsome 0.7.12",
			},
		});

		const expected = `# Custom headers
Header set X-Author "Elon Musk"
Header set X-Generated-By "Gridsome 0.7.12"

`;
		const actual = readFileSync("./static/.htaccess").toString();

		expect(actual).to.be.equal(expected);
	});

	it("should generate the rule that block users agents if the option is filled", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			blockedUserAgents: ["googlebot", "yandex"],
		});

		const expected = `# Blocked user agents
SetEnvIfNoCase ^User-Agent$ .*(googlebot|yandex) HTTP_SAFE_BADBOT
Deny from env=HTTP_SAFE_BADBOT

`;
		const actual = readFileSync("./static/.htaccess").toString();

		expect(actual).to.be.equal(expected);
	});

	it("should generate the rule that block IP addresses if the option is filled", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			blockedIp: ["45.55.99.72", "178.33.40.43"],
		});

		const expected = `# Block IP addresses
order allow,deny
deny from 45.55.99.72
deny from 178.33.40.43
allow from all

`;
		const actual = readFileSync("./static/.htaccess").toString();

		expect(actual).to.be.equal(expected);
	});

	it("should generate the feature policy header if the option is filled", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			featurePolicy: {
				camera: ["self", "hangout.google.com"],
				geolocation: ["none"],
				microphone: ["*"],
			},
		});

		const expected = `# Feature policy
Header set Feature-Policy "camera 'self' hangout.google.com; geolocation 'none'; microphone *"

`;
		const actual = readFileSync("./static/.htaccess").toString();

		expect(actual).to.be.equal(expected);
	});

	it("should generate the feature policy header if the option is filled", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			contentSecurityPolicy: {
				"img-src": ["self"],
				"font-src": ["self", "fonts.google.com"],
				"frame-src": ["none"],
				"media-src": ["src", "youtube.com"],
			},
		});

		const expected = `# Content Security Policy
Header set Content-Security-Policy "img-src 'self'; font-src 'self' fonts.google.com; frame-src 'none'; media-src 'src' youtube.com"

`;
		const actual = readFileSync("./static/.htaccess").toString();

		expect(actual).to.be.equal(expected);
	});

	it("should generate the rules that prevent file caching the option is filled", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			notCachedFiles: [
				"/service-worker.js",
				"/assets/js/service-worker.js",
			],
		});

		const expected = `# Prevent the following files to be cached by your users' browser
<Location "/service-worker.js">
	<IfModule mod_expires.c>
		ExpiresActive Off
	</IfModule>
	<IfModule mod_headers.c>
		FileETag None
		Header unset ETag
		Header unset Pragma
		Header unset Cache - Control
		Header unset Last - Modified
		Header set Pragma "no-cache"
		Header set Cache - Control "max-age=0, no-cache, no-store, must-revalidate"
		Header set Expires "Thu, 1 Jan 1970 00:00:00 GMT"
	</IfModule>
</Location>
<Location "/assets/js/service-worker.js">
	<IfModule mod_expires.c>
		ExpiresActive Off
	</IfModule>
	<IfModule mod_headers.c>
		FileETag None
		Header unset ETag
		Header unset Pragma
		Header unset Cache - Control
		Header unset Last - Modified
		Header set Pragma "no-cache"
		Header set Cache - Control "max-age=0, no-cache, no-store, must-revalidate"
		Header set Expires "Thu, 1 Jan 1970 00:00:00 GMT"
	</IfModule>
</Location>

`;
		const actual = readFileSync("./static/.htaccess").toString();

		expect(actual).to.be.equal(expected);
	});

	it("should generate the rules that apply a default browser cache", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			fileExpirations: {
				default: "access plus one year",
			},
		});

		const expected = `# Default file expiration
ExpiresDefault "access plus one year"

`;
		const actual = readFileSync("./static/.htaccess").toString();

		expect(actual).to.be.equal(expected);
	});

	it("should generate the rules that apply a default browser cache", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			fileExpirations: {
				fileTypes: {
					"text/html": "access plus one day",
				},
			},
		});

		const expected = `# Files expirations
ExpiresByType text/html "access plus one day"

`;
		const actual = readFileSync("./static/.htaccess").toString();

		expect(actual).to.be.equal(expected);
	});

	it("should throw an exception if a file in the notCachedFiles option contains a double quote", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			notCachedFiles: [
				'"/service-worker.js"',
				"/assets/js/service-worker.js",
			],
		});
		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "notCachedFiles[0]" contains a forbidden double quote`
			)
		).to.be.true;
	});

	it("should throw an exception if a header value in the customheaders option contains a double quote", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			customHeaders: {
				"X-Generated-By": '"Gridsome" 0.7.12',
			},
		});
		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "customHeaders.X-Generated-By" contains a forbidden double quote`
			)
		).to.be.true;
	});

	it("should throw an exception if a feature policy value in the featurePolicy option contains a double quote", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			featurePolicy: {
				geolocation: ["self", "src", '"google.com"'],
			},
		});
		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "featurePolicy.geolocation[2]" contains a forbidden double quote`
			)
		).to.be.true;
	});

	it("should throw an exception if a content security policy value in the contentSecurityPolicy option contains a double quote", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			contentSecurityPolicy: {
				"image-src": ["self", "src", '"google.com"'],
			},
		});
		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "contentSecurityPolicy.image-src[2]" contains a forbidden double quote`
			)
		).to.be.true;
	});

	it("should throw an exception if blockedIp option is missing", () => {
		new GridsomeServer(api, {});
		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "blockedIp" must be present`
			)
		).to.be.true;
	});

	it("should throw an exception if blockedIp option is missing", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			blockedIp: [42],
		});
		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "blockedIp[0]" must be a string`
			)
		).to.be.true;
	});

	it("should throw an exception if the redirections option is not an array", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			redirections: 42,
		});
		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "redirections" must be an array`
			)
		).to.be.true;
	});

	it("should throw an exception if the redirections options is not an array of objects", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			redirections: [42],
		});
		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "redirections[0]" must be an object`
			)
		).to.be.true;
	});

	it("should throw an exception if the redirections options is not an array of objects containing the from key", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			redirections: [{}],
		});
		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "redirections[0].from" must be present`
			)
		).to.be.true;
	});

	it("should throw an exception if the redirections options is not an array of objects containing the to key", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			redirections: [{ from: "test" }],
		});
		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "redirections[0].to" must be present`
			)
		).to.be.true;
	});

	it("should throw an exception if the redirections options from key is not an string", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			redirections: [{ from: 42, to: "test" }],
		});
		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "redirections[0].from" must be a string`
			)
		).to.be.true;
	});

	it("should throw an exception if the redirections options to key is not an string", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			redirections: [{ from: "test", to: 42 }],
		});
		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "redirections[0].to" must be a string`
			)
		).to.be.true;
	});

	it("should throw an exception if preventDdosAttacks is not an object when filled", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			preventDdosAttacks: 42,
		});
		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "preventDdosAttacks" must be an object`
			)
		).to.be.true;
	});

	it("should throw an exception if the downloadedFilesSizeLimit is not present in the preventDdosAttacks options", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			preventDdosAttacks: {},
		});
		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "preventDdosAttacks.downloadedFilesSizeLimit" must be present`
			)
		).to.be.true;
	});

	it("should throw an exception if the downloadedFilesSizeLimit key in the preventDdosAttacks options is not a number", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			preventDdosAttacks: { downloadedFilesSizeLimit: "42" },
		});
		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "preventDdosAttacks.downloadedFilesSizeLimit" must be a number`
			)
		).to.be.true;
	});

	it("should throw an exception if the downloadedFilesSizeLimit key in the preventDdosAttacks options is lower than zero", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			preventDdosAttacks: { downloadedFilesSizeLimit: -42 },
		});
		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "preventDdosAttacks.downloadedFilesSizeLimit" must be greater or equal to zero`
			)
		).to.be.true;
	});

	it("should throw an exception if the forceHttps option is not a boolean", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			forceHttps: 42,
		});
		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "forceHttps" must be a boolean`
			)
		).to.be.true;
	});

	it("should throw an exception if featurePolicy option is not an object of arrays", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			featurePolicy: {
				geolocation: 42,
			},
		});
		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "featurePolicy.geolocation" must be an array`
			)
		).to.be.true;
	});

	it("should throw an exception if featurePolicy option is not an object of arrays of strings", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			featurePolicy: {
				geolocation: [42],
			},
		});
		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "featurePolicy.geolocation[0]" must be a string`
			)
		).to.be.true;
	});

	it("should throw an exception if customHeaders option is not an object of strings", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			customHeaders: {
				"X-Generated-By": 42,
			},
		});

		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "customHeaders.X-Generated-By" must be a string`
			)
		).to.be.true;
	});

	it("should throw an exception if the content key of the customContent option is not present", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			customContent: {
				order: "before",
			},
		});

		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "customContent.content" must be present`
			)
		).to.be.true;
	});

	it("should throw an exception if the order key of the customContent option is not present", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			customContent: {
				content: "foo",
			},
		});

		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "customContent.order" must be present`
			)
		).to.be.true;
	});

	it("should throw an exception if the order key of the customContent option is not valid", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			customContent: {
				content: "foo",
				order: "bar",
			},
		});

		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "customContent.order" must be one of [before, after]`
			)
		).to.be.true;
	});

	it("should throw an exception if the content key of the customContent option is not a string", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			customContent: {
				content: 42,
				order: "before",
			},
		});

		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "customContent.content" must be a string`
			)
		).to.be.true;
	});

	it("should throw an exception if the provided ip of the blockedIp option is not valid", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			blockedIp: ["192.168.0."],
		});

		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "blockedIp[0]" must be a valid IP`
			)
		).to.be.true;
	});

	it("should throw an exception if the to key of the redirections option is not a valid absolute path", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			redirections: [
				{
					from: "/about",
					to: "./about-us",
				},
			],
		});

		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "redirections[0].to" must be an absolute path or a valid HTTP URL`
			)
		).to.be.true;
	});

	it("should throw an exception if the from key of the redirections option is not a valid absolute path", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			redirections: [
				{
					from: "./about",
					to: "/about-us",
				},
			],
		});

		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "redirections[0].from" must be an absolute path or a valid HTTP URL`
			)
		).to.be.true;
	});

	it("should throw an exception if the to key of the redirections option is not a valid HTTP URL", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			redirections: [
				{
					from: "/about",
					to: "example.com/about-us",
				},
			],
		});

		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "redirections[0].to" must be an absolute path or a valid HTTP URL`
			)
		).to.be.true;
	});

	it("should throw an exception if the from key of the redirections option is not a valid absolute path", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			redirections: [
				{
					from: "example.com/test",
					to: "/about-us",
				},
			],
		});

		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "redirections[0].from" must be an absolute path or a valid HTTP URL`
			)
		).to.be.true;
	});

	it("should throw an exception if the from key of the redirections option is not a valid absolute path", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			textCompression: ["text/foo"],
		});

		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "textCompression[0]" must be a valid MIME type`
			)
		).to.be.true;
	});

	it("should throw an exception if the default key of the fileExpirations option contains a double quote", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			fileExpirations: {
				default: 'access "plus" one year',
			},
		});

		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "fileExpirations.default" must not contain any double quote`
			)
		).to.be.true;
	});

	it("should throw an exception if the default key of the fileExpirations option is not a string", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			fileExpirations: {
				default: 42,
			},
		});

		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "fileExpirations.default" must be a string`
			)
		).to.be.true;
	});

	it("should throw an exception if the fileTypes key of the fileExpirations option is not an object", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			fileExpirations: {
				fileTypes: 42,
			},
		});

		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "fileExpirations.fileTypes" must be an object`
			)
		).to.be.true;
	});

	it("should throw an exception if the fileTypes key of the fileExpirations option is not a valid MIME type", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			fileExpirations: {
				fileTypes: {
					"text/unknown": "access plus one year",
				},
			},
		});

		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "fileExpirations.fileTypes.text/unknown" must be a valid MIME type`
			)
		).to.be.true;
	});

	it("should throw an exception if the fileTypes key of the fileExpirations option is not a string", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			fileExpirations: {
				fileTypes: {
					"text/html": 42,
				},
			},
		});

		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "fileExpirations.fileTypes.text/html" must be a string`
			)
		).to.be.true;
	});

	it("should throw an exception if the fileTypes key of the fileExpirations option contains a double quote", () => {
		new GridsomeServer(api, {
			...GridsomeServer.defaultOptions(),
			fileExpirations: {
				fileTypes: {
					"text/html": 'access "plus" one year',
				},
			},
		});

		expect(
			console.error.calledWith(
				`gridsome-plugin-htaccess: "fileExpirations.fileTypes.text/html" must not contain any double quote`
			)
		).to.be.true;
	});
});
