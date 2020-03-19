import Vue from "vue";
import { NuxtAppOptions } from "@nuxt/types/app";
import { AuthContainer } from "../";

/**
 * Extends the VueInterface
 */
declare module "vue/types/vue" {
	interface Vue {
		$auth: AuthContainer;
	}
}

declare module "@nuxt/types/app" {
	interface NuxtAppOptions {
		$auth: AuthContainer;
	}
}
