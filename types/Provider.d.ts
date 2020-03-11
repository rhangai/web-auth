type IAuthProviderLoginOptions = {};

type IAuthProviderLogin<TUser = any, TState = any> = {
	state: TState | null;
	user?: TUser | null;
	redirectUri?: string | null;
};

type IAuthProviderData<TUser = any> = {
	user: TUser;
};

export interface IAuthProvider<TUser = any, TState = any, TPayload = any> {
	/**
	 * Perform the login
	 */
	login(
		payload: TPayload,
		options: IAuthProviderLoginOptions
	): Promise<IAuthProviderLogin<TUser, TState>>;
	/**
	 * Perform the logout
	 */
	logout(state: TState): Promise<void>;
	/**
	 * Get the logged user data
	 */
	getUser(state: TState): Promise<IAuthProviderData<TUser>>;
	/**
	 * Revalidate the request and perform a refresh
	 */
	refresh?(state: TState): Promise<IAuthProviderLogin<TUser, TState> | false>;
}
