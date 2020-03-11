import { IAuthContainer, IAuthContainerRefreshOptions } from "../types/AuthContainer";
import { IAuthProvider } from "../types/Provider";
import { IAuthStorage } from "../types/Storage";
import { IAuthPlugin } from "../types/Plugin";

export type AuthContainerOptions = {
	provider: IAuthProvider;
	storage: IAuthStorage;
	plugins?: IAuthPlugin[];
};

export class AuthContainer implements IAuthContainer {
	private user: any = null;
	private state: any = null;
	private plugins: IAuthPlugin[] = [];

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
		if (result) await this._save(result);
	}

	async login(payload: any): Promise<any> {
		const loginResult = await this.options.provider.login(payload, {});
		const result = await this._refreshFromResult(loginResult);
		if (!result) return false;
		await this._save(result);
		return true;
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
	async refresh({ renew }: IAuthContainerRefreshOptions) {
		const user = await this._getUser(this.state);
		if (!user) {
			const result = await this._refreshState(this.state);
			if (!result) {
				await this.logout();
				return false;
			}
		} else if (renew === true) {
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
