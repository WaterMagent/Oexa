
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/private';
 * 
 * console.log(ENVIRONMENT); // => "production"
 * console.log(PUBLIC_BASE_URL); // => throws error during build
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/private' {
	export const SVELTEKIT_FORK: string;
	export const NODE_ENV: string;
	export const TERM_PROGRAM: string;
	export const npm_node_execpath: string;
	export const MAIL: string;
	export const npm_lifecycle_script: string;
	export const LANG: string;
	export const SHLVL: string;
	export const GHOSTTY_SHELL_INTEGRATION_NO_CURSOR: string;
	export const STARSHIP_SESSION_KEY: string;
	export const DISPLAY: string;
	export const XDG_DATA_DIRS: string;
	export const HOME: string;
	export const VISUAL: string;
	export const STARSHIP_SHELL: string;
	export const MOTD_SHOWN: string;
	export const PAGER: string;
	export const FZF_DEFAULT_OPTS: string;
	export const npm_package_version: string;
	export const XDG_SEAT: string;
	export const WINDOWPATH: string;
	export const TERMINFO: string;
	export const MPD_HOST: string;
	export const NODE: string;
	export const JJ_EDITOR: string;
	export const CRUSH: string;
	export const SHELL: string;
	export const npm_execpath: string;
	export const GHOSTTY_BIN_DIR: string;
	export const LOGNAME: string;
	export const npm_command: string;
	export const PATH: string;
	export const GTK_IM_MODULE: string;
	export const COLORTERM: string;
	export const AI_AGENT: string;
	export const npm_config_user_agent: string;
	export const WINDOWID: string;
	export const TERM_PROGRAM_VERSION: string;
	export const TERM: string;
	export const _: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const XDG_SESSION_TYPE: string;
	export const JJ_PAGER: string;
	export const GIT_EDITOR: string;
	export const XDG_VTNR: string;
	export const AGENT: string;
	export const XAUTHORITY: string;
	export const npm_config_local_prefix: string;
	export const BUN_INSTALL: string;
	export const PWD: string;
	export const GHOSTTY_RESOURCES_DIR: string;
	export const XMODIFIERS: string;
	export const QT_QPA_PLATFORM: string;
	export const XDG_SESSION_ID: string;
	export const npm_package_name: string;
	export const USER: string;
	export const EDITOR: string;
	export const GIT_PAGER: string;
	export const XDG_SESSION_CLASS: string;
	export const MPD_PORT: string;
	export const SDL_IM_MODULE: string;
	export const GHOSTTY_SHELL_INTEGRATION_NO_SUDO: string;
	export const npm_lifecycle_event: string;
	export const QT_IM_MODULE: string;
	export const XDG_RUNTIME_DIR: string;
	export const npm_package_json: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
}

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/public';
 * 
 * console.log(ENVIRONMENT); // => throws error during build
 * console.log(PUBLIC_BASE_URL); // => "http://site.com"
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * 
 * console.log(env.ENVIRONMENT); // => "production"
 * console.log(env.PUBLIC_BASE_URL); // => undefined
 * ```
 */
declare module '$env/dynamic/private' {
	export const env: {
		SVELTEKIT_FORK: string;
		NODE_ENV: string;
		TERM_PROGRAM: string;
		npm_node_execpath: string;
		MAIL: string;
		npm_lifecycle_script: string;
		LANG: string;
		SHLVL: string;
		GHOSTTY_SHELL_INTEGRATION_NO_CURSOR: string;
		STARSHIP_SESSION_KEY: string;
		DISPLAY: string;
		XDG_DATA_DIRS: string;
		HOME: string;
		VISUAL: string;
		STARSHIP_SHELL: string;
		MOTD_SHOWN: string;
		PAGER: string;
		FZF_DEFAULT_OPTS: string;
		npm_package_version: string;
		XDG_SEAT: string;
		WINDOWPATH: string;
		TERMINFO: string;
		MPD_HOST: string;
		NODE: string;
		JJ_EDITOR: string;
		CRUSH: string;
		SHELL: string;
		npm_execpath: string;
		GHOSTTY_BIN_DIR: string;
		LOGNAME: string;
		npm_command: string;
		PATH: string;
		GTK_IM_MODULE: string;
		COLORTERM: string;
		AI_AGENT: string;
		npm_config_user_agent: string;
		WINDOWID: string;
		TERM_PROGRAM_VERSION: string;
		TERM: string;
		_: string;
		XDG_CURRENT_DESKTOP: string;
		XDG_SESSION_TYPE: string;
		JJ_PAGER: string;
		GIT_EDITOR: string;
		XDG_VTNR: string;
		AGENT: string;
		XAUTHORITY: string;
		npm_config_local_prefix: string;
		BUN_INSTALL: string;
		PWD: string;
		GHOSTTY_RESOURCES_DIR: string;
		XMODIFIERS: string;
		QT_QPA_PLATFORM: string;
		XDG_SESSION_ID: string;
		npm_package_name: string;
		USER: string;
		EDITOR: string;
		GIT_PAGER: string;
		XDG_SESSION_CLASS: string;
		MPD_PORT: string;
		SDL_IM_MODULE: string;
		GHOSTTY_SHELL_INTEGRATION_NO_SUDO: string;
		npm_lifecycle_event: string;
		QT_IM_MODULE: string;
		XDG_RUNTIME_DIR: string;
		npm_package_json: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://example.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.ENVIRONMENT); // => undefined, not public
 * console.log(env.PUBLIC_BASE_URL); // => "http://example.com"
 * ```
 * 
 * ```
 * 
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
