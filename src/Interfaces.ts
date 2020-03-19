type PromiseOrValue<T> = T | Promise<T>;

// Basic types
export type AuthState = Record<string, any>;
export type AuthUser = Record<string, any>;
export type AuthStore = null | {
	state: AuthState;
	user: AuthUser;
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
	 * User
	 */
	user?: AuthUser | null;
};

/**
 * AuthProvider
 */
export interface AuthProvider {
	/**
	 * Perform the login using the payload
	 * @param payload
	 */
	login(payload: Record<string, string>): PromiseOrValue<AuthProviderLoginResult | null>;
	/**
	 * Do a logout
	 */
	logout?(state: AuthState): PromiseOrValue<void>;
	/**
	 * Renew the state
	 */
	renew?(state: AuthState): PromiseOrValue<AuthProviderLoginResult | null>;
	/**
	 * Get the user according with the state
	 * @param state
	 */
	getUser(state: AuthState): PromiseOrValue<AuthUser | null>;
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
