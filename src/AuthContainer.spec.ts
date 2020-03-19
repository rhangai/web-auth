import { AuthContainer } from "./AuthContainer";
import { take, last } from "rxjs/operators";
describe("AuthContainer", () => {
	it("should be instantiated", () => {
		const authContainer = new AuthContainer({
			provider: null,
			storage: null
		});
		expect(authContainer).toBeInstanceOf(AuthContainer);
	});
});
