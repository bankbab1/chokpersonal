/** Absolute URL to a route inside the app, including the deploy base (e.g. /chokpersonal/ on GitHub Pages). */
export const appUrl = (path: string) => `${window.location.origin}${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
