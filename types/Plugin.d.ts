export type IAuthPluginOptions<TState, TUser> = {
	state: TState | null;
	user: TUser | null;
};

export type IAuthPlugin<TState = any, TUser = any> = (options: IAuthPluginOptions<TState, TUser>) => unknown;
