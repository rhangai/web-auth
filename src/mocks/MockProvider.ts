import { AuthProvider } from "../Interfaces";

export class MockProvider implements AuthProvider {
	private stateValue: any = null;
	private dataValue: any = null;

	login(payload: any) {
		return {
			state: this.stateValue,
		};
	}

	logout() {}

	renew(state: any) {
		return {
			state: state,
		};
	}

	getData(state: any) {
		if (typeof this.dataValue === "function") return this.dataValue(state);
		return this.dataValue;
	}

	state(state: any) {
		this.stateValue = state ?? null;
	}

	data(data: any) {
		this.dataValue = data ?? null;
	}

	set(state: any, data?: any) {
		this.state(state);
		this.data(data);
	}
}
