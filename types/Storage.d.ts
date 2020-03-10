export interface IAuthStorage<TState = any> {
	save(state: TState): Promise<void>;

	load(): Promise<TState>;
}
