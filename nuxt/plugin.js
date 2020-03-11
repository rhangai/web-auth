import { AuthContainer } from "<%= options.lib %>";
import AuthContainerConfig from "<%= options.config %>";

export default function(context, inject) {
	const authContainerConfig =
		typeof AuthContainerConfig === "function"
			? AuthContainerConfig(context)
			: AuthContainerConfig;
	const $auth = new AuthContainer({ ...authContainerConfig });
	inject("auth", $auth);

	/* <% if (options.plugins) { %> */
	/* <% if (options.store) { %>  */
	{
		const store = context.store;
		if (store) {
			const storeName = "<%= options.store %>" || "auth";
			store.registerModule(storeName, {
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

	/* <% if (options.axios) { %> */
	{
		$auth.addPlugin(({ state }) => {
			const axios = context.app.$axios;
			if (!axios) return;
			if (state && state.token) {
				axios.setToken(state.token);
			} else {
				axios.setToken(false);
			}
		});
	}
	/* <% } %> */

	/* <% if (options.apollo) { %> */
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
