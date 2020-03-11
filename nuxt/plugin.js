import { AuthContainer } from "<%= options.lib %>";
import AuthContainerConfig from "<%= options.config %>";

export default function(context, inject) {
	const authContainerConfig =
		typeof AuthContainerConfig === "function"
			? AuthContainerConfig(context)
			: AuthContainerConfig;
	const $auth = new AuthContainer({ ...authContainerConfig });
	inject("auth", $auth);

	/// Adds vuex plugin
	const store = context.store;
	if (store) {
		store.registerModule("__auth", {
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
			store.commit("__auth/SET_USER", { user });
		});
	}
}
