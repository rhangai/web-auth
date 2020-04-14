import { AuthContainer } from "<%= options.lib %>";
import AuthContainerConfig from "<%= options.config %>";

export default async function (context, inject) {
	const authContainerConfig =
		typeof AuthContainerConfig === "function"
			? AuthContainerConfig(context)
			: AuthContainerConfig;
	const $auth = new AuthContainer({ ...authContainerConfig });
	setupPlugins($auth, context);
	inject("auth", $auth);

	try {
		await $auth.init();
	} catch (err) {
		context.error({ message: "Error initializing authenticator" });
	}
}

function setupPlugins($auth, context) {
	/* <% if (options.plugins) { %> */
	/* <% if (options.plugins.store) { %>  */
	{
		const store = context.store;
		if (store) {
			const storeName = "<%= options.store %>" || "auth";
			store.registerModule(storeName, {
				namespaced: true,
				state() {
					return { data: null };
				},
				mutations: {
					SET_DATA(state, payload) {
						state.data = payload.data;
					},
				},
			});
			$auth.addPlugin((authStore) => {
				store.commit(storeName + "/SET_DATA", { data: authStore ? authStore.data : null });
			});
		}
	}
	/* <% } %> */

	/* <% if (options.plugins.axios) { %> */
	{
		$auth.addPlugin((authStore) => {
			const axios = context.app.$axios;
			if (!axios) return;
			if (authStore) {
				axios.setToken(authStore.state.token, "Bearer");
			} else {
				axios.setToken(false);
			}
		});
	}
	/* <% } %> */

	/* <% if (options.plugins.apollo) { %> */
	{
		$auth.addPlugin((authStore) => {
			const apolloHelpers = context.app.$apolloHelpers;
			if (!apolloHelpers) return;
			if (authStore) {
				return apolloHelpers.onLogin(authStore.state.token);
			} else {
				return apolloHelpers.onLogout();
			}
		});
	}
	/* <% } %> */

	/* <% } %> */
}
