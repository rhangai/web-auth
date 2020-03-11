import { IAuthProvider } from "../../types/Provider";

export type SchemeOAuthOptions<TUser = any> = {
	axios: any;
	clientId: string;
	clientSecret?: string | null;
	endpoint: string;
	getUser(state: ProviderOAuthState): Promise<TUser> | TUser;
};

export type ProviderOAuthState = {
	token: string;
	refreshToken: string | null;
};

export type ProviderOAuthPayloadPassword = {
	grantType: "password";
	username: string;
	password: string;
	scope: string;
};

export type ProviderOAuthPayload = ProviderOAuthPayloadPassword;

export class ProviderOAuth<TUser = any>
	implements IAuthProvider<TUser, ProviderOAuthState, ProviderOAuthPayload> {
	constructor(private readonly options: SchemeOAuthOptions<TUser>) {}

	async login(payload: ProviderOAuthPayload) {
		const data: Record<string, string | undefined | null> = {
			client_id: this.options.clientId,
			client_secret: this.options.clientSecret,
			scope: payload.scope
		};
		if (payload.grantType === "password") {
			data.grant_type = payload.grantType;
			data.username = payload.username;
			data.password = payload.password;
		} else {
			throw new Error(`Invalid grantType ${payload.grantType}`);
		}
		const response = await this.options.axios({
			method: "post",
			url: this.options.endpoint,
			data: ProviderOAuth.toQueryString(data),
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

	async getUser(state: ProviderOAuthState) {
		const user: TUser = await this.options.getUser(state);
		return { user };
	}

	async refresh(state: ProviderOAuthState) {
		if (!state.refreshToken) return { state: null };

		const data: Record<string, string | undefined | null> = {
			grant_type: "refresh_token",
			client_id: this.options.clientId,
			client_secret: this.options.clientSecret ?? "",
			refresh_token: state.refreshToken
		};
		const response = await this.options.axios({
			method: "post",
			url: this.options.endpoint,
			data: ProviderOAuth.toQueryString(data),
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
