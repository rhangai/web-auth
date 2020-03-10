import Vue from 'vue';
import { IAuthContainer } from '../types/AuthContainer';

/**
 * Extends the VueInterface
 */
declare module 'vue/types/vue' {
	interface Vue {
		$auth: IAuthContainer;
	}
}
