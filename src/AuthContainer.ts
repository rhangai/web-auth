import {
	IAuthContainer,
	IAuthContainerRefreshOptions,
	IAuthContainerLoginResult
} from "../types/AuthContainer";
import { IAuthProvider } from "../types/Provider";
import { IAuthStorage } from "../types/Storage";
import { IAuthPlugin } from "../types/Plugin";

export type AuthContainerOptions = {
	provider: IAuthProvider;
	storage: IAuthStorage;
	plugins?: IAuthPlugin[];
};

/// Time where the data is valid after initialization
const INITIALIZATION_REFRESH_TIME_THRESHOLD = 5000;

export class AuthContainer implements IAuthContainer {
	private user: any = null;
	private state: any = null;
	private plugins: IAuthPlugin[] = [];
	private refreshValidUntil: number | false = false;

	constructor(private readonly options: AuthContainerOptions) {
		if (options.plugins) {
			this.plugins = [...options.plugins];
		}
	}

	/**
	 * Initialize the authenticator
	 */
	async init() {
		const state = await this.options.storage.load();
		const result = await this._refreshFromResult({ state });
		if (result) {
			await this._save(result);
			this.refreshValidUntil = Date.now() + INITIALIZATION_REFRESH_TIME_THRESHOLD;
		}
	}

	async login(payload: any): Promise<IAuthContainerLoginResult | false> {
		const loginResult = await this.options.provider.login(payload, {});
		const result = await this._refreshFromResult(loginResult);
		if (!result) return false;
		await this._save(result);
		return { redirectUri: loginResult.redirectUri };
	}

	/**
	 * Perform the logout
	 */
	async logout() {
		if (this.state) {
			await this.options.provider.logout(this.state);
		}
		await this._save({ state: null, user: null });
	}

	/**
	 * Perform the refresh
	 */
	async refresh(options: IAuthContainerRefreshOptions = {}) {
		if (this.refreshValidUntil) {
			const isValid = this.refreshValidUntil >= Date.now();
			this.refreshValidUntil = false;
			if (isValid) {
				return true;
			}
		}
		const user = await this._getUser(this.state);
		if (!user) {
			// If no user was found, try to get a new token
			const result = await this._refreshState(this.state);
			if (!result) {
				await this.logout();
				return false;
			}
			await this._save(result);
		} else if (options.renew === true) {
			// If renew is passed, try to get a new token anyway
			const result = await this._refreshState(this.state);
			if (result) {
				await this._save(result);
			}
		}
		return true;
	}
	/**
	 * Perform the refresh
	 */
	getUser() {
		return this.user;
	}

	addPlugin(plugin: IAuthPlugin) {
		this.plugins.push(plugin);
	}

	/**
	 *
	 * @param state
	 */
	private async _getUser(state: any) {
		if (!state) {
			return null;
		}
		const result = await this.options.provider.getUser(state);
		return result.user;
	}

	private async _refreshState(state: any): Promise<any> {
		if (!state) return false;
		if (!this.options.provider.refresh) return false;
		const result = await this.options.provider.refresh(state);
		if (!result) return false;
		return await this._refreshFromResult(result);
	}

	private async _refreshFromResult(result: any): Promise<any> {
		if (!result) return null;
		if (!result.state) return null;
		if (!result.user) {
			result.user = await this._getUser(result.state);
			if (!result.user) return null;
		}
		return result;
	}

	private async _save({ state, user }: any) {
		this.state = state ?? null;
		this.user = user ?? null;
		this.refreshValidUntil = false;
		if (!this.state) {
			await this.options.storage.clear();
		} else {
			await this.options.storage.save(this.state);
		}

		if (this.plugins) {
			await Promise.all(this.plugins.map(plugin => plugin({ state, user })));
		}
	}
}
