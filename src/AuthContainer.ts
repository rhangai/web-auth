import {
	AuthProvider,
	AuthStorage,
	AuthPlugin,
	AuthStore,
	AuthUser,
	AuthState,
} from "./Interfaces";

export type AuthContainerOptions = {
	provider: AuthProvider;
	storage: AuthStorage;
	plugins?: AuthPlugin[];
};

type AuthContainerSetStoreOptions = {
	state?: AuthState | null;
	user?: AuthUser | null;
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
	async login(payload: any): Promise<boolean> {
		const result = await this.options.provider.login(payload);
		return this._storeRefresh(result);
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
	async renew(): Promise<boolean> {
		return this._renew(this.store?.state);
	}

	/**
	 * Refresh the current authenticator and ensures
	 */
	async refresh(): Promise<boolean> {
		if (!this.store) return false;
		if (this.storeInitValidUntil) {
			const now = +new Date();
			const isValidInit = now < this.storeInitValidUntil;
			this.storeInitValidUntil = null;
			if (isValidInit) return true;
		}
		return this._storeRefreshRenew(this.store?.state);
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
		let user = store.user;
		if (!user) {
			user = await this._userGet(state);
		}
		await this._storeSet({ state, user });
		return !!this.store;
	}

	/**
	 * Save the state of the store
	 */
	private async _storeSet(store: AuthContainerSetStoreOptions | null) {
		this.storeInitValidUntil = null;
		if (!store || !store.state || !store.user) {
			this.store = null;
		} else {
			this.store = { state: store.state, user: store.user };
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
	 * Get the user from the state
	 * @param state
	 */
	private async _userGet(state: any): Promise<any> {
		if (!state) return null;
		try {
			const user = await this.options.provider.getUser(state);
			return user;
		} catch (err) {
			if (err.statusCode == 401 || err.statusCode == 403) {
				return null;
			}
			throw err;
		}
	}
}
