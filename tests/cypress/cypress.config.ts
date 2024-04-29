import { defineConfig } from "cypress"

export default defineConfig({
    e2e: {
        specPattern: "./e2e/**/*.cy.ts",
        screenshotsFolder: "./screenshots",
        videosFolder: "cypress/videos",
        screenshotOnRunFailure: true,
        trashAssetsBeforeRuns: true,
        supportFile: "./support/e2e.ts",
        video: false,
        baseUrl: "http://localhost:5003",
        defaultCommandTimeout: 5000, 
        includeShadowDom: true,
    },
})
