import { AuthStorage } from "../Interfaces";

export class MockStorage implements AuthStorage {
	private state: any = null;

	save(state: any) {
		this.state = state;
	}

	load() {
		return this.state;
	}

	clear() {
		this.state = null;
	}
}
