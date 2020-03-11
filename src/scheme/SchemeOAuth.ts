import { IAuthScheme } from "../../types/Scheme";

export type SchemeOAuthOptions = {
	url: string;
};

export class SchemeOAuth implements IAuthScheme {
	constructor(private readonly options: SchemeOAuthOptions) {}

	async login(options: any) {
		return { state: { token: "123456" } };
	}

	async logout() {}

	async getUser() {
		return { user: { id: 1 } };
	}
}
