/** @type {import('vite').UserConfig} */
export default {
  base: process.env.GITHUB_PAGES ? "/dice-battle/" : "/",
  build: {
    target: "ESNext",
  },
};
