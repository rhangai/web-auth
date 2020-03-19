import { AuthProvider } from "../Interfaces";

export class MockProvider implements AuthProvider {
	private stateValue: any = null;
	private userValue: any = null;

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

	getUser(state: any) {
		if (typeof this.userValue === "function") return this.userValue(state);
		return this.userValue;
	}

	state(state: any) {
		this.stateValue = state ?? null;
	}

	user(user: any) {
		this.userValue = user ?? null;
	}

	set(state: any, user?: any) {
		this.state(state);
		this.user(user);
	}
}
