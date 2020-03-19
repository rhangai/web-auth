import { AuthContainer } from "./AuthContainer";
import { MockProvider } from "./mocks/MockProvider";
import { MockStorage } from "./mocks/MockStorage";

describe("AuthContainer", () => {
	it("should be instantiated", () => {
		const authContainer = new AuthContainer({
			provider: new MockProvider(),
			storage: new MockStorage()
		});
		expect(authContainer).toBeInstanceOf(AuthContainer);
	});
});
