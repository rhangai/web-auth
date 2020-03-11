export interface IAuthStorage<TState = any> {
	save(state: TState): void | Promise<void>;

	load(): TState | null | Promise<TState | null>;

	clear(): void | Promise<void>;
}
