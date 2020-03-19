export type StorageStore2Options = {
	store: any;
	key?: string;
};

export class StorageStore2 {
	private readonly store: any;
	private readonly key: string;

	constructor(options: StorageStore2Options) {
		this.store = options.store;
		this.key = options.key || "auth";
	}

	save(state: any) {
		this.store.set(this.key, state);
	}

	load() {
		return this.store.get(this.key);
	}

	clear() {
		this.store.remove(this.key);
	}
}
