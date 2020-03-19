import {
	AuthProvider,
	AuthStorage,
	AuthPlugin,
	AuthStore,
	AuthUser,
	AuthState
} from "./Interfaces";

export type AuthContainerOptions = {
	provider: AuthProvider;
	storage: AuthStorage;
	plugins?: AuthPlugin[];
};

type AuthContainerSetStoreOptions = {
	user: AuthUser | null;
	state: AuthState | null;
};

/**
 * Container for authentication
 */
export class AuthContainer {
	private store: AuthStore = null;
	private plugins: AuthPlugin[];

	/// Construct
	constructor(private readonly options: AuthContainerOptions) {
		this.plugins = options.plugins ? [...options.plugins] : [];
	}

	/**
	 * Initialize the authenticator
	 */
	async init() {
		const state = await this.options.storage.load();
		const user = await this._refreshUser(state);
		await this._setStore({ state, user });
	}

	/**
	 * Perform th elogin
	 * @param payload
	 */
	async login(payload: any): Promise<void> {
		const result = await this.options.provider.login(payload);
		if (!result || !result.state) return;
		const state = result.state;
		let user = result.user;
		if (!user) {
			user = await this._refreshUser(state);
		}
		await this._setStore({ state, user });
	}

	/**
	 * Logs out of the system by setting the value to null
	 */
	async logout() {
		await this._setStore(null);
	}

	/**
	 * Refresh the current authenticator and ensures
	 */
	async refresh() {
		if (!this.store) return false;

		return null;
	}

	/**
	 * Add a new plugin to the container
	 */
	async addPlugin(plugin: AuthPlugin | null) {
		if (plugin) this.plugins.push(plugin);
	}

	/**
	 * Get the user from the state
	 * @param state
	 */
	private async _refreshUser(state: any): Promise<any> {
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

	/**
	 * Save the state of the store
	 */
	private async _setStore(store: AuthContainerSetStoreOptions | null) {
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
}
