import { IAuthScheme } from '../../types/Scheme';

export type SchemeOAuthOptions = {
	url: string;
};

export class SchemeOAuth implements IAuthScheme {
	constructor(private readonly options: SchemeOAuthOptions) {}

	async login(options: any) {
		return { state: null };
	}

	async logout() {}

	async getUser() {
		return { user: null };
	}
}
