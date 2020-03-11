import { IAuthProvider } from "../../types/Provider";

export type SchemeOAuthOptions = {
	axios: any;
	grantType: string;
	clientId: string;
	clientSecret?: string;
	url: string;
	getUser(state: any): any;
};

export type ProviderOAuthState = {
	token: string;
	refreshToken: string | null;
};

export type ProviderOAuthPayload = {
	username: string;
	password: string;
};

export class ProviderOAuth<TUser = any>
	implements IAuthProvider<TUser, ProviderOAuthState, ProviderOAuthPayload> {
	constructor(private readonly options: SchemeOAuthOptions) {}

	async login(payload: ProviderOAuthPayload) {
		const data = new FormData();
		data.append("grant_type", this.options.grantType);
		data.append("client_id", this.options.clientId);
		data.append("client_secret", this.options.clientSecret ?? "");
		data.append("username", this.options.clientSecret ?? "");
		data.append("password", this.options.clientSecret ?? "");
		data.append("scope", this.options.clientSecret ?? "");
		const response = await this.options.axios({
			method: "post",
			url: this.options.url,
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

	async refresh(state: ProviderOAuthState) {
		if (!state.refreshToken) return { state: null };

		const data = new FormData();
		data.append("grant_type", "refresh_token");
		data.append("client_id", this.options.clientId);
		data.append("client_secret", this.options.clientSecret ?? "");
		data.append("refresh_token", state.refreshToken);
		const response = await this.options.axios({
			method: "post",
			url: this.options.url,
			data
		});
		return {
			state: {
				token: response.data.access_token,
				refreshToken: response.data.refresh_token || null
			}
		};
	}

	async getUser(state: ProviderOAuthState) {
		const user: TUser = await this.options.getUser(state);
		return { user };
	}
}
