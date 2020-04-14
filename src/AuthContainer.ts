import {
	AuthProvider,
	AuthStorage,
	AuthPlugin,
	AuthStore,
	AuthData,
	AuthState,
} from "./Interfaces";

export type AuthContainerOptions = {
	provider: AuthProvider;
	storage: AuthStorage;
	plugins?: AuthPlugin[];
};

type AuthContainerSetStoreOptions = {
	state?: AuthState | null;
	data?: AuthData | null;
};

export type AuthContainerResult = {
	isLogged: boolean;
	state: AuthState | null;
	data: AuthData | null;
};

/**
 * Container for authentication
 */
export class AuthContainer {
	private store: AuthStore = null;
	private storeInitValidUntil: number | null = null;
	private plugins: AuthPlugin[];

	/// Construct
	constructor(private readonly options: AuthContainerOptions) {
		this.plugins = options.plugins ? [...options.plugins] : [];
	}

	/**
	 * Initialize the authenticator
	 */
	async init(hasInitializationDelay?: boolean) {
		const state = await this.options.storage.load();
		const isValid = await this._storeRefreshRenew(state);
		if (isValid && hasInitializationDelay !== false) {
			this.storeInitValidUntil = +new Date() + 5000;
		}
	}

	/**
	 * Perform th elogin
	 * @param payload
	 */
	async login(payload: any): Promise<AuthContainerResult> {
		const result = await this.options.provider.login(payload);
		const isLogged = await this._storeRefresh(result);
		return this._getResult(isLogged);
	}

	/**
	 * Logs out of the system by setting the value to null
	 */
	async logout() {
		if (this.store) await this.options.provider.logout?.(this.store.state);
		await this._storeSet(null);
	}

	/**
	 * Logs out of the system by setting the value to null
	 */
	async renew(): Promise<AuthContainerResult> {
		const isLogged = await this._renew(this.store?.state);
		return this._getResult(isLogged);
	}

	/**
	 * Refresh the current authenticator and ensures
	 */
	async refresh(): Promise<AuthContainerResult> {
		if (!this.store) return this._getResult(false);
		if (this.storeInitValidUntil) {
			const now = +new Date();
			const isValidInit = now < this.storeInitValidUntil;
			this.storeInitValidUntil = null;
			if (isValidInit) return this._getResult(true);
		}
		const isLogged = await this._storeRefreshRenew(this.store?.state);
		return this._getResult(isLogged);
	}

	private _getResult(isLogged: boolean): AuthContainerResult {
		return {
			isLogged,
			state: this.store?.state ?? null,
			data: this.store?.data ?? null,
		};
	}

	/**
	 * Refresh the store and renew if needed
	 */
	async _storeRefreshRenew(state: AuthState | undefined | null): Promise<boolean> {
		if (!state) return false;
		let isValid = await this._storeRefresh({ state });
		if (isValid) {
			const needRenew = !!(await this.options.provider.needToRenew?.(state));
			if (needRenew) {
				await this._renew(state);
			}
		} else if (!isValid) {
			isValid = await this._renew(state);
		}
		return isValid;
	}

	/**
	 * Logs out of the system by setting the value to null
	 */
	private async _renew(state: AuthState | undefined | null): Promise<boolean> {
		if (!state) return false;
		const result = await this.options.provider.renew?.(state);
		if (!result) return false;
		return this._storeRefresh(result);
	}

	/**
	 * Add a new plugin to the container
	 */
	addPlugin(plugin: AuthPlugin | null): void {
		if (plugin) this.plugins.push(plugin);
	}

	/**
	 * Refresh the store
	 */
	async _storeRefresh(store: AuthContainerSetStoreOptions | null): Promise<boolean> {
		if (!store || !store.state) {
			await this._storeSet(null);
			return false;
		}
		const state = store.state;
		let data = store.data;
		if (!data) {
			data = await this._dataGet(state);
		}
		await this._storeSet({ state, data });
		return !!this.store;
	}

	/**
	 * Save the state of the store
	 */
	private async _storeSet(store: AuthContainerSetStoreOptions | null) {
		this.storeInitValidUntil = null;
		if (!store || !store.state || !store.data) {
			this.store = null;
		} else {
			this.store = { state: store.state, data: store.data };
		}
		if (this.store) {
			await this.options.storage.save(this.store.state);
		} else {
			await this.options.storage.clear();
		}

		for (const plugin of this.plugins) {
			try {
				await plugin(this.store);
			} catch (err) {
				console.error(err);
			}
		}
	}
	/**
	 * Get the data from the state
	 * @param state
	 */
	private async _dataGet(state: any): Promise<any> {
		if (!state) return null;
		try {
			const data = await this.options.provider.getData(state);
			return data;
		} catch (err) {
			if (err.statusCode == 401 || err.statusCode == 403) {
				return null;
			}
			throw err;
		}
	}
}
