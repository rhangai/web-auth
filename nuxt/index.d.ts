import Vue from "vue";
import { NuxtAppOptions } from "@nuxt/types/app";
import { IAuthContainer } from "../types/AuthContainer";

/**
 * Extends the VueInterface
 */
declare module "vue/types/vue" {
	interface Vue {
		$auth: IAuthContainer;
	}
}

declare module "@nuxt/types/app" {
	interface NuxtAppOptions {
		$auth: IAuthContainer;
	}
}
