import { IAuthContainer } from '../types/AuthContainer';
import { IAuthScheme } from '../types/Scheme';
import { IAuthStorage } from '../types/Storage';
import { IAuthPlugin } from '../types/Plugin';

export type AuthContainerOptions = {
	scheme: IAuthScheme;
	storage: IAuthStorage;
};

export class AuthContainer implements IAuthContainer {
	private user: any = null;
	private state: any = null;
	private plugins: IAuthPlugin[] = [];

	constructor(private readonly options: AuthContainerOptions) {}

	async init() {
		const state = await this.options.storage.load();
		const result = this._refreshFromResult({ state });
		await this._save(result);
	}

	async login(payload: any): Promise<any> {
		const loginResult = await this.options.scheme.login({ payload });
		const result = await this._refreshFromResult(loginResult);
		if (!result) return false;
		await this._save(result);
		return true;
	}

	async logout() {
		if (this.state) {
			await this.options.scheme.logout(this.state);
		}
		await this._save({ state: null, user: null });
	}

	/**
	 * Perform the refresh
	 */
	async refresh() {
		const user = await this._getUser(this.state);
		if (!user) {
			const result = await this._refreshState(this.state);
			if (!result) {
				await this.logout();
				return false;
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
		const result = await this.options.scheme.getUser(state);
		return result.user;
	}

	private async _refreshState(state: any): Promise<any> {
		if (!state) return false;
		if (!this.options.scheme.refresh) return false;
		const result = await this.options.scheme.refresh(state);
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
		await this.options.storage.save(this.state);
		if (this.plugins) {
			await Promise.all(this.plugins.map(plugin => plugin({ state, user })));
		}
	}
}
