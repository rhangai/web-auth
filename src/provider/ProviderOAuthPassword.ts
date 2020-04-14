import { AuthProvider } from "../Interfaces";

export type ProviderOAuthPasswordOptions = {
	axios: any;
	clientId: string;
	clientSecret?: string | null;
	tokenEndpoint: string;
	/// Number in seconds to allow a token to refresh
	tokenExpiresThreshold?: number;
	/// Implements token refresh on OAUTH
	tokenRefresh?: boolean;
	/// Get the current data
	getData(state: ProviderOAuthPasswordState): Promise<Record<string, any>> | Record<string, any>;
};

/**
 * State to keep
 */
export type ProviderOAuthPasswordState = {
	token: string;
	expiresAt: string | null;
	refreshToken: string | null;
};

/**
 * Payload
 */
export type ProviderOAuthPasswordPayload = {
	username: string;
	password: string;
	scope: string;
	data?: Record<string, string>;
	params?: Record<string, string>;
};

/**
 * Provider for OAuth using axios
 */
export class ProviderOAuthPassword implements AuthProvider {
	constructor(private readonly options: ProviderOAuthPasswordOptions) {}

	/**
	 * Try to login using the authorization code
	 * @param payload
	 */
	async login(payload: ProviderOAuthPasswordPayload) {
		const data: Record<string, string | undefined | null> = {
			client_id: this.options.clientId,
			client_secret: this.options.clientSecret,
			grant_type: "password",
			scope: payload.scope,
			username: payload.username,
			password: payload.password,
			...payload.data,
		};
		const response = await this.options.axios({
			method: "post",
			url: this.options.tokenEndpoint,
			data: ProviderOAuthPassword.toQueryString(data),
			params: payload.params,
			headers: { "content-type": "application/x-www-form-urlencoded" },
		});
		let expiresAt: number | null = null;
		if (response.data.expires_in) {
			expiresAt = Math.floor(Date.now() / 1000) + response.data.expires_in;
		}
		return {
			state: {
				token: response.data.access_token,
				expiresAt,
				refreshToken: response.data.refresh_token || null,
			},
		};
	}

	async getData(state: ProviderOAuthPasswordState) {
		const data = await this.options.getData(state);
		return data;
	}

	/// If the expiration time of the token
	needToRenew(state: ProviderOAuthPasswordState) {
		if (!state.expiresAt) return false;

		const expiresAt = parseInt(state.expiresAt, 10);
		if (!expiresAt) return false;

		const delta = expiresAt - Math.floor(Date.now() / 1000);
		const tokenExpiresThreshold = this.options.tokenExpiresThreshold || 60 * 15;
		return delta < tokenExpiresThreshold;
	}

	async renew(state: ProviderOAuthPasswordState) {
		if (!this.options.tokenRefresh) return null;
		if (!state.refreshToken) return null;

		const data: Record<string, string | undefined | null> = {
			grant_type: "refresh_token",
			client_id: this.options.clientId,
			client_secret: this.options.clientSecret,
			refresh_token: state.refreshToken,
		};
		const response = await this.options.axios({
			method: "post",
			url: this.options.tokenEndpoint,
			data: ProviderOAuthPassword.toQueryString(data),
			headers: { "content-type": "application/x-www-form-urlencoded" },
		});

		let expiresAt: number | null = null;
		if (response.data.expires_in) {
			expiresAt = Math.floor(Date.now() / 1000) + response.data.expires_in;
		}
		return {
			state: {
				token: response.data.access_token,
				expiresAt,
				refreshToken: response.data.refresh_token || null,
			},
		};
	}

	static toQueryString(obj: Record<string, string | undefined | null>): string {
		const parts: string[] = [];
		for (const key in obj) {
			const value = obj[key];
			if (value == null) continue;
			parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
		}
		return parts.join("&");
	}
}
