import { AuthContainer } from "./";
import { MockProvider } from "./mocks/MockProvider";
import { MockStorage } from "./mocks/MockStorage";

describe("AuthContainer", () => {
	let authContainer: AuthContainer;
	let provider: MockProvider;
	let plugin: jest.Mock;
	beforeEach(() => {
		provider = new MockProvider();
		authContainer = new AuthContainer({
			provider: provider,
			storage: new MockStorage({ $data: { fromStorage: true } }),
		});
		plugin = jest.fn(() => null);
		authContainer.addPlugin(plugin as any);
	});
	it("should be instantiated", () => {
		expect(authContainer).toBeInstanceOf(AuthContainer);
	});

	it("should perform a login", async () => {
		provider.set({}, {});
		const { isLogged } = await authContainer.login({});
		expect(isLogged).toBe(true);
	});

	it("should perform a login (invalid)", async () => {
		provider.state(null);
		const { isLogged } = await authContainer.login({});
		expect(isLogged).toBe(false);
	});

	it("should use plugins", async () => {
		provider.set({}, {});
		await authContainer.login({});
		expect(plugin).toBeCalled();
	});

	it("should perform initialization from storage", async () => {
		provider.data((state: any) => {
			return state.$data;
		});
		await authContainer.init();
		expect(plugin.mock.calls[0][0]).toHaveProperty("data");
		expect(plugin.mock.calls[0][0].data).toMatchObject({ fromStorage: true });
	});

	it("should perform a logout", async () => {
		provider.set({}, {});
		const { isLogged } = await authContainer.login({});
		expect(isLogged).toBe(true);
		await authContainer.logout();
	});

	it("should perform refreshs", async () => {
		provider.set({}, {});
		const { isLogged } = await authContainer.login({});
		expect(isLogged).toBe(true);
		const { isLogged: isLoggedRefresh } = await authContainer.refresh();
		expect(isLoggedRefresh).toBe(true);
	});

	it("should perform refreshs (not logged)", async () => {
		provider.set(null);
		const { isLogged } = await authContainer.refresh();
		expect(isLogged).toBe(false);
	});

	it("should perform refreshs (init)", async () => {
		provider.set({}, {});
		await authContainer.init();
		const result = await authContainer.refresh();
		expect(result).toHaveProperty("isLogged", true);
		expect(result).toHaveProperty("state");
		expect(result).toHaveProperty("data");
	});

	it("should perform refreshs (unauthorized)", async () => {
		provider.set({}, () => {
			const error: any = new Error(`Unauthorized`);
			error.statusCode = 401;
			throw error;
		});
		await authContainer.init(false);
		const result = await authContainer.refresh();
		expect(result).toHaveProperty("isLogged", false);
		expect(result).toHaveProperty("state", null);
		expect(result).toHaveProperty("data", null);
	});
});
