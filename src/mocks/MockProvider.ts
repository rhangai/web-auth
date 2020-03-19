import { AuthProvider } from "../Interfaces";

export class MockProvider implements AuthProvider {
	login() {
		return {
			state: {
				token: "mock"
			}
		};
	}

	getUser(state: any) {
		return {
			name: state.token
		};
	}
}
