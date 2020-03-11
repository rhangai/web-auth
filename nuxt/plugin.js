import { AuthContainer } from "<%= options.lib %>";
import AuthContainerConfig from "<%= options.config %>";

export default function({ store }, inject) {
	const $auth = new AuthContainer(AuthContainerConfig);
	inject("auth", $auth);

	/// Adds vuex plugin
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
