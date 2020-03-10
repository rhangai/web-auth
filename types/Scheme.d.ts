type IAuthSchemeLoginOptions<TPayload = any> = {
	payload: TPayload;
};

type IAuthSchemeLogin<TUser = any, TState = any> = {
	state: TState | null;
	user?: TUser | null;
};

type IAuthSchemeData<TUser = any> = {
	user: TUser;
};

export interface IAuthScheme<TState = any, TUser = any, TPayload = any> {
	/**
	 * Perform the login
	 */
	login(options: IAuthSchemeLoginOptions<TPayload>): Promise<IAuthSchemeLogin<TUser, TState>>;
	/**
	 * Perform the logout
	 */
	logout(state: TState): Promise<void>;
	/**
	 * Get the logged user data
	 */
	getUser(state: TState): Promise<IAuthSchemeData<TUser>>;
	/**
	 * Revalidate the request and perform a refresh
	 */
	refresh?(state: TState): Promise<IAuthSchemeLogin<TUser, TState>>;
}
