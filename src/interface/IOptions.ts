import {
	IContentSecurityPolicy,
	ICustomContent,
	ICustomHeaders,
	IDdosAttackPreventionOption,
	IFeaturePolicy,
	IFileExpirations,
	IRedirection,
} from "./index";

interface IOptions {
	contentSecurityPolicy: IContentSecurityPolicy;
	featurePolicy: IFeaturePolicy;
	disableDirectoryIndex: boolean;
	disableServerSignature: boolean;
	preventImageHotLinking: boolean;
	hotLinkingRedirectLink?: string;
	pingable: boolean;
	forceHttps: boolean;
	textCompression: Array<string>;
	notCachedFiles: Array<string>;
	redirections: Array<IRedirection>;
	preventScriptInjection: boolean;
	preventDdosAttacks?: IDdosAttackPreventionOption;
	fileExpirations: IFileExpirations;
	customHeaders: ICustomHeaders;
	blockedUserAgents: Array<string>;
	blockedIp: Array<string>;
	customContent?: ICustomContent;
}

export default IOptions;
