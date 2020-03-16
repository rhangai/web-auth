import { AuthContainer } from "<%= options.lib %>";
import AuthContainerConfig from "<%= options.config %>";

export default async function(context, inject) {
	const authContainerConfig =
		typeof AuthContainerConfig === "function"
			? AuthContainerConfig(context)
			: AuthContainerConfig;
	const $auth = new AuthContainer({ ...authContainerConfig });
	setupPlugins($auth, context);
	inject("auth", $auth);
	await $auth.init();
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
					return { user: null };
				},
				mutations: {
					SET_USER(state, payload) {
						state.user = payload.user;
					}
				}
			});
			$auth.addPlugin(({ user }) => {
				store.commit(storeName + "/SET_USER", { user });
			});
		}
	}
	/* <% } %> */

	/* <% if (options.plugins.axios) { %> */
	{
		$auth.addPlugin(({ state }) => {
			const axios = context.app.$axios;
			if (!axios) return;
			if (state && state.token) {
				axios.setToken(state.token, "Bearer");
			} else {
				axios.setToken(false);
			}
		});
	}
	/* <% } %> */

	/* <% if (options.plugins.apollo) { %> */
	{
		$auth.addPlugin(({ state }) => {
			const apolloHelpers = context.app.$apolloHelpers;
			if (!apolloHelpers) return;
			if (state && state.token) {
				apolloHelpers.onLogin(state.token);
			} else {
				apolloHelpers.onLogout();
			}
		});
	}
	/* <% } %> */

	/* <% } %> */
}
