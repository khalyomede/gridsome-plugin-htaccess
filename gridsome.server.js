'use strict';

var fs = require('fs');

class InvalidCharacterError extends Error {
}

class MissingKeyError extends Error {
}

class InvalidArgumentException extends Error {
}

const word = '[a-fA-F\\d:]';
const b = options => options && options.includeBoundaries ?
	`(?:(?<=\\s|^)(?=${word})|(?<=${word})(?=\\s|$))` :
	'';

const v4 = '(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}';

const v6seg = '[a-fA-F\\d]{1,4}';
const v6 = `
(
(?:${v6seg}:){7}(?:${v6seg}|:)|                                // 1:2:3:4:5:6:7::  1:2:3:4:5:6:7:8
(?:${v6seg}:){6}(?:${v4}|:${v6seg}|:)|                         // 1:2:3:4:5:6::    1:2:3:4:5:6::8   1:2:3:4:5:6::8  1:2:3:4:5:6::1.2.3.4
(?:${v6seg}:){5}(?::${v4}|(:${v6seg}){1,2}|:)|                 // 1:2:3:4:5::      1:2:3:4:5::7:8   1:2:3:4:5::8    1:2:3:4:5::7:1.2.3.4
(?:${v6seg}:){4}(?:(:${v6seg}){0,1}:${v4}|(:${v6seg}){1,3}|:)| // 1:2:3:4::        1:2:3:4::6:7:8   1:2:3:4::8      1:2:3:4::6:7:1.2.3.4
(?:${v6seg}:){3}(?:(:${v6seg}){0,2}:${v4}|(:${v6seg}){1,4}|:)| // 1:2:3::          1:2:3::5:6:7:8   1:2:3::8        1:2:3::5:6:7:1.2.3.4
(?:${v6seg}:){2}(?:(:${v6seg}){0,3}:${v4}|(:${v6seg}){1,5}|:)| // 1:2::            1:2::4:5:6:7:8   1:2::8          1:2::4:5:6:7:1.2.3.4
(?:${v6seg}:){1}(?:(:${v6seg}){0,4}:${v4}|(:${v6seg}){1,6}|:)| // 1::              1::3:4:5:6:7:8   1::8            1::3:4:5:6:7:1.2.3.4
(?::((?::${v6seg}){0,5}:${v4}|(?::${v6seg}){1,7}|:))           // ::2:3:4:5:6:7:8  ::2:3:4:5:6:7:8  ::8             ::1.2.3.4
)(%[0-9a-zA-Z]{1,})?                                           // %eth0            %1
`.replace(/\s*\/\/.*$/gm, '').replace(/\n/g, '').trim();

const ip = options => options && options.exact ?
	new RegExp(`(?:^${v4}$)|(?:^${v6}$)`) :
	new RegExp(`(?:${b(options)}${v4}${b(options)})|(?:${b(options)}${v6}${b(options)})`, 'g');

ip.v4 = options => options && options.exact ? new RegExp(`^${v4}$`) : new RegExp(`${b(options)}${v4}${b(options)}`, 'g');
ip.v6 = options => options && options.exact ? new RegExp(`^${v6}$`) : new RegExp(`${b(options)}${v6}${b(options)}`, 'g');

var ipRegex = ip;

const isIp = string => ipRegex({exact: true}).test(string);
isIp.v4 = string => ipRegex.v4({exact: true}).test(string);
isIp.v6 = string => ipRegex.v6({exact: true}).test(string);
isIp.version = string => isIp(string) ? (isIp.v4(string) ? 4 : 6) : undefined;

var isIp_1 = isIp;
var isIp_2 = isIp_1.v4;
var isIp_3 = isIp_1.v6;

class GridsomePluginHtaccess {
    constructor(api, options) {
        this._htaccessLines = [];
        this._options = options;
        this._htaccessContent = "";
        api.beforeBuild(() => {
            console.time("gridsome-plugin-htaccess");
            try {
                this._checkOptions();
            }
            catch (error) {
                if (error instanceof InvalidCharacterError ||
                    error instanceof TypeError ||
                    error instanceof MissingKeyError ||
                    error instanceof RangeError ||
                    error instanceof InvalidArgumentException) {
                    console.error(`gridsome-plugin-htaccess: ${error.message}`);
                    console.timeEnd("gridsome-plugin-htaccess");
                    return;
                }
                else {
                    throw error;
                }
            }
            this._insertDisableDirectoryIndex();
            this._insertDisableServerSignature();
            this._insertPingable();
            this._insertForceHttps();
            this._insertTextCompression();
            this._insertNotCachedFiles();
            this._insertRedirections();
            this._insertPreventScriptInjection();
            this._insertPreventDdosAttacks();
            this._insertCustomHeaders();
            this._insertBlockedUserAgents();
            this._insertBlockedIp();
            this._insertFeaturePolicy();
            this._insertContentSecurityPolicy();
            this._setHtaccessContent();
            this._insertCustomContent();
            this._writeHtaccessFile();
            console.timeEnd("gridsome-plugin-htaccess");
        });
    }
    static defaultOptions() {
        return {
            blockedUserAgents: [],
            blockedIp: [],
            contentSecurityPolicy: {},
            customHeaders: {},
            disableDirectoryIndex: false,
            featurePolicy: {},
            /**
             * @todo
             */
            filesExpiration: {},
            forceHttps: false,
            notCachedFiles: [],
            pingable: true,
            /**
             * @todo
             */
            preventImageHotLinking: true,
            /**
             * @todo
             */
            preventScriptInjection: false,
            redirections: [],
            disableServerSignature: false,
            textCompression: [],
        };
    }
    _checkOptions() {
        this._checkBlockedIpOption();
        this._checkBlockedUserAgentsOption();
        this._checkContentSecurityPolicyOption();
        this._checkCustomContent();
        this._checkCustomHeadersOption();
        this._checkDisableDirectoryIndexOption();
        this._checkFeaturePolicyOption();
        this._checkForceHttpsOption();
        this._checkNotCachedFilesOption();
        this._checkPingableOption();
        this._checkPreventDdosAttacksOption();
        this._checkPreventScriptInjectionOption();
        this._checkRedirectionsOption();
        this._checkDisableServerSignatureOption();
        this._checkTextCompressionOption();
    }
    _insertDisableDirectoryIndex() {
        if (this._options.disableDirectoryIndex) {
            this._htaccessLines.push("# Disable directory index");
            this._htaccessLines.push("Options All -Indexes");
            this._htaccessLines.push("\n");
        }
    }
    _insertDisableServerSignature() {
        if (this._options.disableServerSignature) {
            this._htaccessLines.push("# Prevent your server from sending the version of the server");
            this._htaccessLines.push("Server Signature Off");
            this._htaccessLines.push("\n");
        }
    }
    _insertPingable() {
        if (!this._options.pingable) {
            this._htaccessLines.push("# Prevent from being able to ping this domain");
            this._htaccessLines.push("RewriteEngine on");
            this._htaccessLines.push("RewriteCond %{REQUEST_METHOD} ^(TRACE|TRACK)");
            this._htaccessLines.push("RewriteRule .* - [F]");
            this._htaccessLines.push("\n");
        }
    }
    _insertForceHttps() {
        if (this._options.forceHttps) {
            this._htaccessLines.push("# Users' browser will be forced to visit the HTTPS version of your web app");
            this._htaccessLines.push("RewriteEngine On");
            this._htaccessLines.push("RewriteCond %{HTTPS} off");
            this._htaccessLines.push("RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI} [R,L]");
            this._htaccessLines.push(`Header set Strict-Transport-Security "max-age=31536000; includeSubDomains"`);
            this._htaccessLines.push("\n");
        }
    }
    _insertTextCompression() {
        if (this._options.textCompression.length > 0) {
            this._htaccessLines.push("# Enable text compression");
            this._htaccessLines.push("<IfModule mod_deflate.c>");
            for (const mimeType of this._options.textCompression) {
                this._htaccessLines.push(`\tAddOutputFilterByType DEFLATE ${mimeType}`);
            }
            this._htaccessLines.push("</IfModule>");
            this._htaccessLines.push("\n");
        }
    }
    _setHtaccessContent() {
        if (this._htaccessLines.length > 0) {
            this._htaccessContent = this._htaccessLines.join("\n");
        }
    }
    _writeHtaccessFile() {
        if (this._htaccessContent.length > 0) {
            fs.writeFileSync("./static/.htaccess", this._htaccessContent);
        }
    }
    _insertNotCachedFiles() {
        if (this._options.notCachedFiles.length > 0) {
            this._htaccessLines.push("# Prevent the following files to be cached by your users' browser");
            for (const file of this._options.notCachedFiles) {
                this._htaccessLines.push(`<Location "${file}">`);
                this._htaccessLines.push("\t<IfModule mod_expires.c>");
                this._htaccessLines.push("\t\tExpiresActive Off");
                this._htaccessLines.push("\t</IfModule>");
                this._htaccessLines.push("\t<IfModule mod_headers.c>");
                this._htaccessLines.push("\t\tFileETag None");
                this._htaccessLines.push("\t\tHeader unset ETag");
                this._htaccessLines.push("\t\tHeader unset Pragma");
                this._htaccessLines.push("\t\tHeader unset Cache - Control");
                this._htaccessLines.push("\t\tHeader unset Last - Modified");
                this._htaccessLines.push(`\t\tHeader set Pragma "no-cache"`);
                this._htaccessLines.push(`\t\tHeader set Cache - Control "max-age=0, no-cache, no-store, must-revalidate"`);
                this._htaccessLines.push(`\t\tHeader set Expires "Thu, 1 Jan 1970 00:00:00 GMT"`);
                this._htaccessLines.push("\t</IfModule>");
                this._htaccessLines.push("</Location>");
            }
            this._htaccessLines.push("\n");
        }
    }
    _insertRedirections() {
        if (this._options.redirections.length > 0) {
            this._htaccessLines.push("# Permanents redirections (301)");
            for (const { from, to } of this._options.redirections) {
                this._htaccessLines.push(`Redirect 301 ${from} ${to}`);
            }
            this._htaccessLines.push("\n");
        }
    }
    _insertPreventScriptInjection() {
        if (this._options.preventScriptInjection) {
            this._htaccessLines.push("# Preventing script injection");
            this._htaccessLines.push("Options + FollowSymLinks");
            this._htaccessLines.push("RewriteEngine On");
            this._htaccessLines.push("RewriteCond % { QUERY_STRING }(<|% 3C).* script.* (>|% 3E)[NC, OR]");
            this._htaccessLines.push("RewriteCond % { QUERY_STRING } GLOBALS(=|[|% [0 - 9A - Z]{ 0, 2})[OR]");
            this._htaccessLines.push("RewriteCond % { QUERY_STRING } _REQUEST(=|[|% [0 - 9A - Z]{ 0, 2})");
            this._htaccessLines.push("RewriteRule ^ (.*)$ index.html[F, L]");
            this._htaccessLines.push("\n");
        }
    }
    _insertPreventDdosAttacks() {
        if ("preventDdosAttacks" in this._options &&
            this._options.preventDdosAttacks instanceof Object &&
            "downloadedFilesSizeLimit" in this._options.preventDdosAttacks) {
            this._htaccessLines.push("# Preventing DDOS Attacks");
            this._htaccessLines.push(`LimitRequestBody ${this._options.preventDdosAttacks.downloadedFilesSizeLimit}`);
            this._htaccessLines.push("\n");
        }
    }
    _insertCustomHeaders() {
        if (Object.keys(this._options.customHeaders).length > 0) {
            this._htaccessLines.push("# Custom headers");
            for (const headerName in this._options.customHeaders) {
                const headerContent = this._options.customHeaders[headerName];
                this._htaccessLines.push(`Header set ${headerName} "${headerContent}"`);
            }
            this._htaccessLines.push("\n");
        }
    }
    _insertBlockedUserAgents() {
        if (this._options.blockedUserAgents.length > 0) {
            const userAgents = this._options.blockedUserAgents.reduce((userAgents, userAgent) => `${userAgents}|${userAgent}`);
            this._htaccessLines.push("# Blocked user agents");
            this._htaccessLines.push(`SetEnvIfNoCase ^User-Agent$ .*(${userAgents}) HTTP_SAFE_BADBOT`);
            this._htaccessLines.push("Deny from env=HTTP_SAFE_BADBOT");
            this._htaccessLines.push("\n");
        }
    }
    _insertBlockedIp() {
        if (this._options.blockedIp.length > 0) {
            this._htaccessLines.push("# Block IP addresses");
            this._htaccessLines.push("order allow,deny");
            for (const ip of this._options.blockedIp) {
                this._htaccessLines.push(`deny from ${ip}`);
            }
            this._htaccessLines.push("allow from all");
            this._htaccessLines.push("\n");
        }
    }
    _insertFeaturePolicy() {
        if (Object.keys(this._options.featurePolicy).length > 0) {
            let features = [];
            for (const featureName in this._options.featurePolicy) {
                let values = this._options.featurePolicy[featureName];
                values = values.map(value => ["none", "src", "self"].includes(value)
                    ? `'${value}'`
                    : value);
                const featureValues = values.join(" ");
                features.push(`${featureName} ${featureValues}`);
            }
            const featureDirectives = features.reduce((features, feature) => `${features}; ${feature}`);
            this._htaccessLines.push("# Feature policy");
            this._htaccessLines.push(`Header set Feature-Policy "${featureDirectives}"`);
            this._htaccessLines.push("\n");
        }
    }
    _insertContentSecurityPolicy() {
        if (Object.keys(this._options.contentSecurityPolicy).length > 0) {
            let policies = [];
            for (const policyName in this._options.contentSecurityPolicy) {
                let values = this._options.contentSecurityPolicy[policyName];
                values = values.map(policy => ["none", "src", "self"].includes(policy)
                    ? `'${policy}'`
                    : policy);
                const policyValues = values.join(" ");
                policies.push(`${policyName} ${policyValues}`);
            }
            const policyDirectives = policies.reduce((policies, policy) => `${policies}; ${policy}`);
            this._htaccessLines.push("# Content Security Policy");
            this._htaccessLines.push(`Header set Content-Security-Policy "${policyDirectives}"`);
            this._htaccessLines.push("\n");
        }
    }
    _throwIfMissingOption(option) {
        if (!(option in this._options)) {
            throw new MissingKeyError(`"${option}" must be present`);
        }
    }
    _throwIfOptionNotBoolean(option) {
        if (typeof this._options[option] !== "boolean") {
            throw new TypeError(`"${option}" must be a boolean`);
        }
    }
    _throwIfOptionNotArray(option) {
        if (!Array.isArray(this._options[option])) {
            throw new TypeError(`"${option}" must be an array`);
        }
    }
    _throwIfOptionNotArrayOfStrings(option) {
        for (const [index, item] of this._options[option].entries()) {
            if (typeof item !== "string") {
                throw new TypeError(`"${option}[${index}]" must be a string`);
            }
        }
    }
    _throwIfOptionNotObject(option) {
        if (!(this._options[option] instanceof Object)) {
            throw new TypeError(`"${option}" must be an object`);
        }
    }
    _throwIfOptionNotObjectOfArrays(option) {
        for (const key in this._options[option]) {
            const value = this._options[option][key];
            if (!Array.isArray(value)) {
                throw new TypeError(`"${option}.${key}" must be an array`);
            }
        }
    }
    _throwIfOptionNotObjectOfStrings(option) {
        for (const key in this._options[option]) {
            const value = this._options[option][key];
            if (typeof value !== "string") {
                throw new TypeError(`"${option}.${key}" must be a string`);
            }
        }
    }
    _throwIfOptionNotObjectOfArraysOfStrings(option) {
        for (const key in this._options[option]) {
            const array = this._options[option][key];
            for (const [index, item] of array.entries()) {
                if (typeof item !== "string") {
                    throw new TypeError(`"${option}.${key}[${index}]" must be a string`);
                }
            }
        }
    }
    _checkBlockedIpOption() {
        const optionName = "blockedIp";
        this._throwIfMissingOption(optionName);
        this._throwIfOptionNotArray(optionName);
        this._throwIfOptionNotArrayOfStrings(optionName);
        for (const [index, ip] of this._options.blockedIp.entries()) {
            if (!isIp_2(ip) && !isIp_3(ip)) {
                throw new InvalidArgumentException(`"blockedIp[${index}]" must be a valid IP`);
            }
        }
    }
    _checkBlockedUserAgentsOption() {
        const optionName = "blockedUserAgents";
        this._throwIfMissingOption(optionName);
        this._throwIfOptionNotArray(optionName);
        this._throwIfOptionNotArrayOfStrings(optionName);
    }
    _checkContentSecurityPolicyOption() {
        const optionName = "contentSecurityPolicy";
        this._throwIfMissingOption(optionName);
        this._throwIfOptionNotObject(optionName);
        this._throwIfOptionNotObjectOfArrays(optionName);
        this._throwIfOptionNotObjectOfArraysOfStrings(optionName);
        for (const key in this._options.contentSecurityPolicy) {
            const values = this._options.contentSecurityPolicy[key];
            for (const [index, value] of values.entries()) {
                if (value.includes('"')) {
                    throw new InvalidCharacterError(`"${optionName}.${key}[${index}]" contains a forbidden double quote`);
                }
            }
        }
    }
    _checkCustomHeadersOption() {
        const optionName = "customHeaders";
        this._throwIfMissingOption(optionName);
        this._throwIfOptionNotObject(optionName);
        this._throwIfOptionNotObjectOfStrings(optionName);
        for (const headerName in this._options.customHeaders) {
            const headerContent = this._options.customHeaders[headerName];
            if (headerContent.includes('"')) {
                throw new InvalidCharacterError(`"${optionName}.${headerName}" contains a forbidden double quote`);
            }
        }
    }
    _checkDisableDirectoryIndexOption() {
        const optionName = "disableDirectoryIndex";
        this._throwIfMissingOption(optionName);
        this._throwIfOptionNotBoolean(optionName);
    }
    _checkFeaturePolicyOption() {
        const optionName = "featurePolicy";
        this._throwIfMissingOption(optionName);
        this._throwIfOptionNotObject(optionName);
        this._throwIfOptionNotObjectOfArrays(optionName);
        this._throwIfOptionNotObjectOfArraysOfStrings(optionName);
        for (const key in this._options.featurePolicy) {
            const values = this._options.featurePolicy[key];
            for (const [index, value] of values.entries()) {
                if (value.includes('"')) {
                    throw new InvalidCharacterError(`"${optionName}.${key}[${index}]" contains a forbidden double quote`);
                }
            }
        }
    }
    _checkForceHttpsOption() {
        const optionName = "forceHttps";
        this._throwIfMissingOption(optionName);
        this._throwIfOptionNotBoolean(optionName);
    }
    _checkNotCachedFilesOption() {
        const optionName = "notCachedFiles";
        this._throwIfMissingOption(optionName);
        this._throwIfOptionNotArray(optionName);
        this._throwIfOptionNotArrayOfStrings(optionName);
        for (const [index, file] of this._options.notCachedFiles.entries()) {
            if (file.includes('"')) {
                throw new InvalidCharacterError(`"${optionName}[${index}]" contains a forbidden double quote`);
            }
        }
    }
    _checkPingableOption() {
        const optionName = "pingable";
        this._throwIfMissingOption(optionName);
        this._throwIfOptionNotBoolean(optionName);
    }
    _checkPreventDdosAttacksOption() {
        if ("preventDdosAttacks" in this._options &&
            this._options.preventDdosAttacks !== undefined) {
            const optionName = "preventDdosAttacks";
            this._throwIfOptionNotObject(optionName);
            if (!("downloadedFilesSizeLimit" in
                this._options.preventDdosAttacks)) {
                throw new MissingKeyError(`"${optionName}.downloadedFilesSizeLimit" must be present`);
            }
            if (typeof this._options.preventDdosAttacks
                .downloadedFilesSizeLimit !== "number") {
                throw new TypeError(`"${optionName}.downloadedFilesSizeLimit" must be a number`);
            }
            if (this._options.preventDdosAttacks.downloadedFilesSizeLimit < 0) {
                throw new RangeError(`"${optionName}.downloadedFilesSizeLimit" must be greater or equal to zero`);
            }
        }
    }
    _checkPreventScriptInjectionOption() {
        const optionName = "preventScriptInjection";
        this._throwIfMissingOption(optionName);
        this._throwIfOptionNotBoolean(optionName);
    }
    _checkRedirectionsOption() {
        const optionName = "redirections";
        this._throwIfMissingOption(optionName);
        this._throwIfOptionNotArray(optionName);
        for (const [index, redirection,] of this._options.redirections.entries()) {
            if (!(redirection instanceof Object)) {
                throw new TypeError(`"${optionName}[${index}]" must be an object`);
            }
            if (!("from" in redirection)) {
                throw new MissingKeyError(`"${optionName}[${index}].from" must be present`);
            }
            if (!("to" in redirection)) {
                throw new MissingKeyError(`"${optionName}[${index}].to" must be present`);
            }
            if (typeof redirection.from !== "string") {
                throw new TypeError(`"${optionName}[${index}].from" must be a string`);
            }
            if (typeof redirection.to !== "string") {
                throw new TypeError(`"${optionName}[${index}].to" must be a string`);
            }
        }
    }
    _checkDisableServerSignatureOption() {
        const optionName = "disableServerSignature";
        this._throwIfMissingOption(optionName);
        this._throwIfOptionNotBoolean(optionName);
    }
    _checkTextCompressionOption() {
        const optionName = "textCompression";
        this._throwIfMissingOption(optionName);
        this._throwIfOptionNotArray(optionName);
        this._throwIfOptionNotArrayOfStrings(optionName);
    }
    _checkCustomContent() {
        const optionName = "customContent";
        if (optionName in this._options &&
            this._options.customContent !== undefined) {
            this._throwIfOptionNotObject(optionName);
            if (!("order" in this._options.customContent)) {
                throw new MissingKeyError(`"${optionName}.order" must be present`);
            }
            if (!("content" in this._options.customContent)) {
                throw new MissingKeyError(`"${optionName}.content" must be present`);
            }
            if (!["before", "after"].includes(this._options.customContent.order)) {
                throw new RangeError(`"${optionName}.order" must be one of [before, after]`);
            }
            if (typeof this._options.customContent.content !== "string") {
                throw new TypeError(`"${optionName}.content" must be a string`);
            }
        }
    }
    _insertCustomContent() {
        if ("customContent" in this._options &&
            this._options.customContent !== undefined) {
            if (this._options.customContent.order === "before") {
                this._htaccessContent = `${this._options.customContent.content}\n\n${this._htaccessContent}`;
            }
            else if (this._options.customContent.order === "after") {
                this._htaccessContent = `${this._htaccessContent}${this._options.customContent.content}\n`;
            }
        }
    }
}

module.exports = GridsomePluginHtaccess;
