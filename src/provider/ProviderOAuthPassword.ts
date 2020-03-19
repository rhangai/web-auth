export type ProviderOAuthPasswordOptions<TUser = any> = {
	axios: any;
	clientId: string;
	clientSecret?: string | null;
	tokenEndpoint: string;
	tokenRefresh?: boolean;
	getUser(state: ProviderOAuthPasswordState): Promise<TUser> | TUser;
};

export type ProviderOAuthPasswordState = {
	token: string;
	refreshToken: string | null;
};

export type ProviderOAuthPasswordPayload = {
	username: string;
	password: string;
	scope: string;
};

/**
 * Provider for OAuth using axios
 */
export class ProviderOAuthPassword<TUser = any> {
	constructor(private readonly options: ProviderOAuthPasswordOptions<TUser>) {}

	/**
	 * Try to login using the authorization code
	 * @param payload
	 */
	async login(payload: ProviderOAuthPasswordPayload) {
		const data: Record<string, string | undefined | null> = {
			client_id: this.options.clientId,
			client_secret: this.options.clientSecret,
			scope: payload.scope
		};
		data.grant_type = "password";
		data.username = payload.username;
		data.password = payload.password;
		const response = await this.options.axios({
			method: "post",
			url: this.options.tokenEndpoint,
			data: ProviderOAuthPassword.toQueryString(data),
			headers: { "content-type": "application/x-www-form-urlencoded" }
		});
		return {
			state: {
				token: response.data.access_token,
				refreshToken: response.data.refresh_token || null
			}
		};
	}

	async logout() {}

	async getUser(state: ProviderOAuthPasswordState) {
		const user: TUser = await this.options.getUser(state);
		return { user };
	}

	async refresh(state: ProviderOAuthPasswordState) {
		if (!this.options.tokenRefresh) return false;
		if (!state.refreshToken) return { state: null };

		const data: Record<string, string | undefined | null> = {
			grant_type: "refresh_token",
			client_id: this.options.clientId,
			client_secret: this.options.clientSecret,
			refresh_token: state.refreshToken
		};
		const response = await this.options.axios({
			method: "post",
			url: this.options.tokenEndpoint,
			data: ProviderOAuthPassword.toQueryString(data),
			headers: { "content-type": "application/x-www-form-urlencoded" }
		});
		return {
			state: {
				token: response.data.access_token,
				refreshToken: response.data.refresh_token || null
			}
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
