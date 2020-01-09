import { IOptions, IApi } from "./interface";
import {
	InvalidCharacterError,
	MissingKeyError,
	InvalidArgumentError,
} from "./exception";
import { writeFileSync } from "fs";
import { isAbsolute } from "path";
import { v4, v6 } from "is-ip";
import mimeDb from "mime-db";
import isUrlHttp from "is-url-http";

class GridsomePluginHtaccess {
	protected _options: IOptions;
	protected _htaccessLines: Array<string>;
	protected _htaccessContent: string;

	public constructor(api: IApi, options: IOptions) {
		this._htaccessLines = [];
		this._options = options;
		this._htaccessContent = "";

		api.beforeBuild(() => {
			console.time("gridsome-plugin-htaccess");

			try {
				this._checkOptions();
			} catch (error) {
				if (
					error instanceof InvalidCharacterError ||
					error instanceof TypeError ||
					error instanceof MissingKeyError ||
					error instanceof RangeError ||
					error instanceof InvalidArgumentError
				) {
					console.error(`gridsome-plugin-htaccess: ${error.message}`);
					console.timeEnd("gridsome-plugin-htaccess");

					return;
				} else {
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

	public static defaultOptions(): IOptions {
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

	private _checkOptions(): void {
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

	private _insertDisableDirectoryIndex(): void {
		if (this._options.disableDirectoryIndex) {
			this._htaccessLines.push("# Disable directory index");
			this._htaccessLines.push("Options All -Indexes");
			this._htaccessLines.push("\n");
		}
	}

	private _insertDisableServerSignature(): void {
		if (this._options.disableServerSignature) {
			this._htaccessLines.push(
				"# Prevent your server from sending the version of the server"
			);
			this._htaccessLines.push("Server Signature Off");
			this._htaccessLines.push("\n");
		}
	}

	private _insertPingable(): void {
		if (!this._options.pingable) {
			this._htaccessLines.push(
				"# Prevent from being able to ping this domain"
			);
			this._htaccessLines.push("RewriteEngine on");
			this._htaccessLines.push(
				"RewriteCond %{REQUEST_METHOD} ^(TRACE|TRACK)"
			);
			this._htaccessLines.push("RewriteRule .* - [F]");
			this._htaccessLines.push("\n");
		}
	}

	private _insertForceHttps(): void {
		if (this._options.forceHttps) {
			this._htaccessLines.push(
				"# Users' browser will be forced to visit the HTTPS version of your web app"
			);
			this._htaccessLines.push("RewriteEngine On");
			this._htaccessLines.push("RewriteCond %{HTTPS} off");
			this._htaccessLines.push(
				"RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI} [R,L]"
			);
			this._htaccessLines.push(
				`Header set Strict-Transport-Security "max-age=31536000; includeSubDomains"`
			);
			this._htaccessLines.push("\n");
		}
	}

	private _insertTextCompression(): void {
		if (this._options.textCompression.length > 0) {
			this._htaccessLines.push("# Enable text compression");
			this._htaccessLines.push("<IfModule mod_deflate.c>");

			for (const mimeType of this._options.textCompression) {
				this._htaccessLines.push(
					`\tAddOutputFilterByType DEFLATE ${mimeType}`
				);
			}

			this._htaccessLines.push("</IfModule>");
			this._htaccessLines.push("\n");
		}
	}

	private _setHtaccessContent(): void {
		if (this._htaccessLines.length > 0) {
			this._htaccessContent = this._htaccessLines.join("\n");
		}
	}

	private _writeHtaccessFile(): void {
		if (this._htaccessContent.length > 0) {
			writeFileSync("./static/.htaccess", this._htaccessContent);
		}
	}

	private _insertNotCachedFiles(): void {
		if (this._options.notCachedFiles.length > 0) {
			this._htaccessLines.push(
				"# Prevent the following files to be cached by your users' browser"
			);

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
				this._htaccessLines.push(
					`\t\tHeader set Cache - Control "max-age=0, no-cache, no-store, must-revalidate"`
				);
				this._htaccessLines.push(
					`\t\tHeader set Expires "Thu, 1 Jan 1970 00:00:00 GMT"`
				);
				this._htaccessLines.push("\t</IfModule>");
				this._htaccessLines.push("</Location>");
			}

			this._htaccessLines.push("\n");
		}
	}

	private _insertRedirections(): void {
		if (this._options.redirections.length > 0) {
			this._htaccessLines.push("# Permanents redirections (301)");

			for (const { from, to } of this._options.redirections) {
				this._htaccessLines.push(`Redirect 301 ${from} ${to}`);
			}

			this._htaccessLines.push("\n");
		}
	}

	private _insertPreventScriptInjection(): void {
		if (this._options.preventScriptInjection) {
			this._htaccessLines.push("# Preventing script injection");
			this._htaccessLines.push("Options + FollowSymLinks");
			this._htaccessLines.push("RewriteEngine On");
			this._htaccessLines.push(
				"RewriteCond % { QUERY_STRING }(<|% 3C).* script.* (>|% 3E)[NC, OR]"
			);
			this._htaccessLines.push(
				"RewriteCond % { QUERY_STRING } GLOBALS(=|[|% [0 - 9A - Z]{ 0, 2})[OR]"
			);
			this._htaccessLines.push(
				"RewriteCond % { QUERY_STRING } _REQUEST(=|[|% [0 - 9A - Z]{ 0, 2})"
			);
			this._htaccessLines.push("RewriteRule ^ (.*)$ index.html[F, L]");
			this._htaccessLines.push("\n");
		}
	}

	private _insertPreventDdosAttacks(): void {
		if (
			"preventDdosAttacks" in this._options &&
			this._options.preventDdosAttacks instanceof Object &&
			"downloadedFilesSizeLimit" in this._options.preventDdosAttacks
		) {
			this._htaccessLines.push("# Preventing DDOS Attacks");
			this._htaccessLines.push(
				`LimitRequestBody ${this._options.preventDdosAttacks.downloadedFilesSizeLimit}`
			);
			this._htaccessLines.push("\n");
		}
	}

	private _insertCustomHeaders(): void {
		if (Object.keys(this._options.customHeaders).length > 0) {
			this._htaccessLines.push("# Custom headers");

			for (const headerName in this._options.customHeaders) {
				const headerContent = this._options.customHeaders[headerName];

				this._htaccessLines.push(
					`Header set ${headerName} "${headerContent}"`
				);
			}

			this._htaccessLines.push("\n");
		}
	}

	private _insertBlockedUserAgents(): void {
		if (this._options.blockedUserAgents.length > 0) {
			const userAgents = this._options.blockedUserAgents.reduce(
				(userAgents, userAgent) => `${userAgents}|${userAgent}`
			);

			this._htaccessLines.push("# Blocked user agents");
			this._htaccessLines.push(
				`SetEnvIfNoCase ^User-Agent$ .*(${userAgents}) HTTP_SAFE_BADBOT`
			);
			this._htaccessLines.push("Deny from env=HTTP_SAFE_BADBOT");
			this._htaccessLines.push("\n");
		}
	}

	private _insertBlockedIp(): void {
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

	private _insertFeaturePolicy(): void {
		if (Object.keys(this._options.featurePolicy).length > 0) {
			let features: Array<string> = [];

			for (const featureName in this._options.featurePolicy) {
				let values = this._options.featurePolicy[featureName];

				values = values.map(value =>
					["none", "src", "self"].includes(value)
						? `'${value}'`
						: value
				);

				const featureValues = values.join(" ");

				features.push(`${featureName} ${featureValues}`);
			}

			const featureDirectives = features.reduce(
				(features, feature) => `${features}; ${feature}`
			);

			this._htaccessLines.push("# Feature policy");
			this._htaccessLines.push(
				`Header set Feature-Policy "${featureDirectives}"`
			);
			this._htaccessLines.push("\n");
		}
	}

	private _insertContentSecurityPolicy(): void {
		if (Object.keys(this._options.contentSecurityPolicy).length > 0) {
			let policies: Array<string> = [];

			for (const policyName in this._options.contentSecurityPolicy) {
				let values = this._options.contentSecurityPolicy[policyName];

				values = values.map(policy =>
					[
						"none",
						"src",
						"self",
						"unsafe-eval",
						"unsafe-hashes",
						"unsafe-inline",
						"strict-dynamic",
						"report-sample",
					].includes(policy)
						? `'${policy}'`
						: policy
				);

				const policyValues = values.join(" ");

				policies.push(`${policyName} ${policyValues}`);
			}

			const policyDirectives = policies.reduce(
				(policies, policy) => `${policies}; ${policy}`
			);

			this._htaccessLines.push("# Content Security Policy");
			this._htaccessLines.push(
				`Header set Content-Security-Policy "${policyDirectives}"`
			);
			this._htaccessLines.push("\n");
		}
	}

	private _throwIfMissingOption(option: string): void {
		if (!(option in this._options)) {
			throw new MissingKeyError(`"${option}" must be present`);
		}
	}

	private _throwIfOptionNotBoolean(option: string): void {
		if (typeof this._options[option] !== "boolean") {
			throw new TypeError(`"${option}" must be a boolean`);
		}
	}

	private _throwIfOptionNotArray(option: string): void {
		if (!Array.isArray(this._options[option])) {
			throw new TypeError(`"${option}" must be an array`);
		}
	}

	private _throwIfOptionNotArrayOfStrings(option: string): void {
		for (const [index, item] of this._options[option].entries()) {
			if (typeof item !== "string") {
				throw new TypeError(`"${option}[${index}]" must be a string`);
			}
		}
	}

	private _throwIfOptionNotObject(option: string): void {
		if (!(this._options[option] instanceof Object)) {
			throw new TypeError(`"${option}" must be an object`);
		}
	}

	private _throwIfOptionNotObjectOfArrays(option: string): void {
		for (const key in this._options[option]) {
			const value = this._options[option][key];

			if (!Array.isArray(value)) {
				throw new TypeError(`"${option}.${key}" must be an array`);
			}
		}
	}

	private _throwIfOptionNotObjectOfStrings(option: string) {
		for (const key in this._options[option]) {
			const value = this._options[option][key];

			if (typeof value !== "string") {
				throw new TypeError(`"${option}.${key}" must be a string`);
			}
		}
	}

	private _throwIfOptionNotObjectOfArraysOfStrings(option: string): void {
		for (const key in this._options[option]) {
			const array = this._options[option][key];

			for (const [index, item] of array.entries()) {
				if (typeof item !== "string") {
					throw new TypeError(
						`"${option}.${key}[${index}]" must be a string`
					);
				}
			}
		}
	}

	private _checkBlockedIpOption(): void {
		const optionName = "blockedIp";

		this._throwIfMissingOption(optionName);
		this._throwIfOptionNotArray(optionName);
		this._throwIfOptionNotArrayOfStrings(optionName);

		for (const [index, ip] of this._options.blockedIp.entries()) {
			if (!v4(ip) && !v6(ip)) {
				throw new InvalidArgumentError(
					`"blockedIp[${index}]" must be a valid IP`
				);
			}
		}
	}

	private _checkBlockedUserAgentsOption(): void {
		const optionName = "blockedUserAgents";

		this._throwIfMissingOption(optionName);
		this._throwIfOptionNotArray(optionName);
		this._throwIfOptionNotArrayOfStrings(optionName);
	}

	private _checkContentSecurityPolicyOption(): void {
		const optionName = "contentSecurityPolicy";

		this._throwIfMissingOption(optionName);
		this._throwIfOptionNotObject(optionName);
		this._throwIfOptionNotObjectOfArrays(optionName);
		this._throwIfOptionNotObjectOfArraysOfStrings(optionName);

		for (const key in this._options.contentSecurityPolicy) {
			const values = this._options.contentSecurityPolicy[key];

			for (const [index, value] of values.entries()) {
				if (value.includes('"')) {
					throw new InvalidCharacterError(
						`"${optionName}.${key}[${index}]" contains a forbidden double quote`
					);
				}
			}
		}
	}

	private _checkCustomHeadersOption(): void {
		const optionName = "customHeaders";

		this._throwIfMissingOption(optionName);
		this._throwIfOptionNotObject(optionName);
		this._throwIfOptionNotObjectOfStrings(optionName);

		for (const headerName in this._options.customHeaders) {
			const headerContent = this._options.customHeaders[headerName];

			if (headerContent.includes('"')) {
				throw new InvalidCharacterError(
					`"${optionName}.${headerName}" contains a forbidden double quote`
				);
			}
		}
	}

	private _checkDisableDirectoryIndexOption(): void {
		const optionName = "disableDirectoryIndex";

		this._throwIfMissingOption(optionName);
		this._throwIfOptionNotBoolean(optionName);
	}

	private _checkFeaturePolicyOption(): void {
		const optionName = "featurePolicy";

		this._throwIfMissingOption(optionName);
		this._throwIfOptionNotObject(optionName);
		this._throwIfOptionNotObjectOfArrays(optionName);
		this._throwIfOptionNotObjectOfArraysOfStrings(optionName);

		for (const key in this._options.featurePolicy) {
			const values = this._options.featurePolicy[key];

			for (const [index, value] of values.entries()) {
				if (value.includes('"')) {
					throw new InvalidCharacterError(
						`"${optionName}.${key}[${index}]" contains a forbidden double quote`
					);
				}
			}
		}
	}

	private _checkForceHttpsOption(): void {
		const optionName = "forceHttps";

		this._throwIfMissingOption(optionName);
		this._throwIfOptionNotBoolean(optionName);
	}

	private _checkNotCachedFilesOption(): void {
		const optionName = "notCachedFiles";

		this._throwIfMissingOption(optionName);
		this._throwIfOptionNotArray(optionName);
		this._throwIfOptionNotArrayOfStrings(optionName);

		for (const [index, file] of this._options.notCachedFiles.entries()) {
			if (file.includes('"')) {
				throw new InvalidCharacterError(
					`"${optionName}[${index}]" contains a forbidden double quote`
				);
			}
		}
	}

	private _checkPingableOption(): void {
		const optionName = "pingable";

		this._throwIfMissingOption(optionName);
		this._throwIfOptionNotBoolean(optionName);
	}

	private _checkPreventDdosAttacksOption(): void {
		if (
			"preventDdosAttacks" in this._options &&
			this._options.preventDdosAttacks !== undefined
		) {
			const optionName = "preventDdosAttacks";

			this._throwIfOptionNotObject(optionName);

			if (
				!(
					"downloadedFilesSizeLimit" in
					this._options.preventDdosAttacks
				)
			) {
				throw new MissingKeyError(
					`"${optionName}.downloadedFilesSizeLimit" must be present`
				);
			}

			if (
				typeof this._options.preventDdosAttacks
					.downloadedFilesSizeLimit !== "number"
			) {
				throw new TypeError(
					`"${optionName}.downloadedFilesSizeLimit" must be a number`
				);
			}

			if (this._options.preventDdosAttacks.downloadedFilesSizeLimit < 0) {
				throw new RangeError(
					`"${optionName}.downloadedFilesSizeLimit" must be greater or equal to zero`
				);
			}
		}
	}

	private _checkPreventScriptInjectionOption(): void {
		const optionName = "preventScriptInjection";

		this._throwIfMissingOption(optionName);
		this._throwIfOptionNotBoolean(optionName);
	}

	private _checkRedirectionsOption(): void {
		const optionName = "redirections";

		this._throwIfMissingOption(optionName);
		this._throwIfOptionNotArray(optionName);

		for (const [
			index,
			redirection,
		] of this._options.redirections.entries()) {
			if (!(redirection instanceof Object)) {
				throw new TypeError(
					`"${optionName}[${index}]" must be an object`
				);
			}

			if (!("from" in redirection)) {
				throw new MissingKeyError(
					`"${optionName}[${index}].from" must be present`
				);
			}

			if (!("to" in redirection)) {
				throw new MissingKeyError(
					`"${optionName}[${index}].to" must be present`
				);
			}

			if (typeof redirection.from !== "string") {
				throw new TypeError(
					`"${optionName}[${index}].from" must be a string`
				);
			}

			if (typeof redirection.to !== "string") {
				throw new TypeError(
					`"${optionName}[${index}].to" must be a string`
				);
			}

			if (!isAbsolute(redirection.from) && !isUrlHttp(redirection.from)) {
				throw new InvalidArgumentError(
					`"${optionName}[${index}].from" must be an absolute path or a valid HTTP URL`
				);
			}

			if (!isAbsolute(redirection.to) && !isUrlHttp(redirection.to)) {
				throw new InvalidArgumentError(
					`"${optionName}[${index}].to" must be an absolute path or a valid HTTP URL`
				);
			}
		}
	}

	private _checkDisableServerSignatureOption(): void {
		const optionName = "disableServerSignature";

		this._throwIfMissingOption(optionName);
		this._throwIfOptionNotBoolean(optionName);
	}

	private _checkTextCompressionOption(): void {
		const optionName = "textCompression";

		this._throwIfMissingOption(optionName);
		this._throwIfOptionNotArray(optionName);
		this._throwIfOptionNotArrayOfStrings(optionName);

		for (const [
			index,
			mimeType,
		] of this._options.textCompression.entries()) {
			if (!(mimeType in mimeDb)) {
				throw new InvalidArgumentError(
					`"textCompression[${index}]" must be a valid MIME type`
				);
			}
		}
	}

	private _checkCustomContent(): void {
		const optionName = "customContent";

		if (
			optionName in this._options &&
			this._options.customContent !== undefined
		) {
			this._throwIfOptionNotObject(optionName);

			if (!("order" in this._options.customContent)) {
				throw new MissingKeyError(
					`"${optionName}.order" must be present`
				);
			}

			if (!("content" in this._options.customContent)) {
				throw new MissingKeyError(
					`"${optionName}.content" must be present`
				);
			}

			if (
				!["before", "after"].includes(this._options.customContent.order)
			) {
				throw new RangeError(
					`"${optionName}.order" must be one of [before, after]`
				);
			}

			if (typeof this._options.customContent.content !== "string") {
				throw new TypeError(`"${optionName}.content" must be a string`);
			}
		}
	}

	private _insertCustomContent(): void {
		if (
			"customContent" in this._options &&
			this._options.customContent !== undefined
		) {
			if (this._options.customContent.order === "before") {
				this._htaccessContent = `${this._options.customContent.content}\n\n${this._htaccessContent}`;
			} else if (this._options.customContent.order === "after") {
				this._htaccessContent = `${this._htaccessContent}${this._options.customContent.content}\n`;
			}
		}
	}
}

export default GridsomePluginHtaccess;
