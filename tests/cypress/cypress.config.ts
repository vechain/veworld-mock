/* eslint-disable @typescript-eslint/no-unused-vars */
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
        baseUrl: "http://localhost:8669",
        defaultCommandTimeout: 5000
    },
})
