type PromiseOrValue<T> = T | Promise<T>;

// Basic types
export type AuthState = Record<string, any>;
export type AuthData = Record<string, any>;
export type AuthStore = null | {
	state: AuthState;
	data: AuthData;
};

/**
 * AuthProviderResult
 */
export type AuthProviderLoginResult = {
	/**
	 * State
	 */
	state: AuthState;
	/**
	 * Data
	 */
	data?: AuthData | null;
};

/**
 * AuthProvider
 */
export interface AuthProvider {
	/**
	 * Perform the login using the payload
	 * @param payload
	 */
	login(payload: Record<string, any>): PromiseOrValue<AuthProviderLoginResult | null>;
	/**
	 * Do a logout
	 */
	logout?(state: AuthState): PromiseOrValue<void>;
	/**
	 * Check if needs to renew the authentication
	 */
	needToRenew?(state: AuthState): PromiseOrValue<boolean>;
	/**
	 * Renew the state
	 */
	renew?(state: AuthState): PromiseOrValue<AuthProviderLoginResult | null>;
	/**
	 * Get the data according with the state
	 * @param state
	 */
	getData(state: AuthState): PromiseOrValue<AuthData | null>;
}

/**
 * AuthStorage
 */
export interface AuthStorage {
	/**
	 * Save the state on the storage
	 */
	save(state: AuthState): PromiseOrValue<void>;
	/**
	 * Load a value from the storage
	 */
	load(): PromiseOrValue<AuthState>;
	/**
	 * Clear the storage
	 */
	clear(): PromiseOrValue<void>;
}

/**
 * AuthPlugin
 */
export interface AuthPlugin {
	(store: AuthStore): PromiseOrValue<void>;
}
