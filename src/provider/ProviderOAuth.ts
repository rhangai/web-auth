import { IAuthProvider } from "../../types/Provider";

export type SchemeOAuthOptions<TUser = any> = {
	axios: any;
	clientId: string;
	clientSecret?: string;
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
		const data = new FormData();
		data.append("client_id", this.options.clientId);
		data.append("client_secret", this.options.clientSecret ?? "");
		if (payload.grantType === "password") {
			data.append("grant_type", payload.grantType);
			data.append("username", payload.username);
			data.append("password", payload.password);
		} else {
			throw new Error(`Invalid grantType ${payload.grantType}`);
		}
		data.append("scope", payload.scope);
		const response = await this.options.axios({
			method: "post",
			url: this.options.endpoint,
			data
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

		const data = new FormData();
		data.append("grant_type", "refresh_token");
		data.append("client_id", this.options.clientId);
		data.append("client_secret", this.options.clientSecret ?? "");
		data.append("refresh_token", state.refreshToken);
		const response = await this.options.axios({
			method: "post",
			url: this.options.endpoint,
			data
		});
		return {
			state: {
				token: response.data.access_token,
				refreshToken: response.data.refresh_token || null
			}
		};
	}
}
