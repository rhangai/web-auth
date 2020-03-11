export interface IAuthStorage<TState = any> {
	save(state: TState | null): Promise<void>;

	load(): Promise<TState | null>;
}
