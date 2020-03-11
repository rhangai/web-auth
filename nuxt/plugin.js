import { AuthContainer } from '<%= options.AuthContainer %>';
import { <%= options.storage.moduleImport %> as Storage } from '<%= options.storage.module %>';
import { <%= options.scheme.moduleImport %> as Scheme } from '<%= options.scheme.module %>';

export default function({ store }, inject) {
	const $auth = new AuthContainer({
		storage: new Storage(<%= options.storage %>),
		scheme: new Scheme(<%= options.scheme %>),
	});
	inject('auth', $auth);

	store.registerModule('__auth', {
		state() {
			return { user: null };
		},
		mutations: {
			SET_USER(state, payload) {
				state.user = payload.user;
			},
		},
	});
	$auth.addPlugin(({ user }) => {
		store.commit('__auth/SET_USER', { user });
	});
}
