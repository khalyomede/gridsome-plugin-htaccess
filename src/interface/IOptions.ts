import {
	IContentSecurityPolicy,
	IFeaturePolicy,
	IRedirection,
	IDdosAttackPreventionOption,
	IFilesExpiration,
	ICustomHeaders,
	ICustomContent,
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
	filesExpiration: IFilesExpiration;
	customHeaders: ICustomHeaders;
	blockedUserAgents: Array<string>;
	blockedIp: Array<string>;
	customContent?: ICustomContent;
}

export default IOptions;
