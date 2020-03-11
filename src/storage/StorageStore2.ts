import { IAuthStorage } from "../../types/Storage";

export type StorageStore2Options = {
	store: any;
	key: string;
};

export class StorageStore2 implements IAuthStorage {
	constructor(private readonly options: StorageStore2Options) {}
	save(state: any) {
		this.options.store.set(this.options.key, state);
	}

	load() {
		return this.options.store.get(this.options.key);
	}

	clear() {
		this.options.store.remove(this.options.key);
	}
}
