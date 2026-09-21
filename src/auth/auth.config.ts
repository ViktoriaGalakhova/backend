export const AUTH_OPTIONS = 'AUTH_OPTIONS';

export const AUTH_SECURITY_SCHEME = 'supertokens';

export const ACCESS_TOKEN_COOKIE = 'sAccessToken';

export type AuthOptions = {
  connectionUri: string;
  apiKey?: string;
  appName: string;
  apiDomain: string;
  websiteDomain: string;
  apiBasePath: string;
  websiteBasePath: string;
  adminEmails: string[];
};
