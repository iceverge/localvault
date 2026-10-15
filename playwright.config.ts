import { defineConfig } from "@playwright/test";
export default defineConfig({
    testDir: "./tests/browser",
    fullyParallel: false,
    use: {
        baseURL: "http://127.0.0.1:8001",
        launchOptions: { channel: "chrome" },
    },
    webServer: {
        command:
            "touch /tmp/localvault-e2e.sqlite && php artisan migrate:fresh --force && php artisan serve --host=127.0.0.1 --port=8001 --no-reload",
        url: "http://127.0.0.1:8001",
        env: {
            DB_DATABASE: "/tmp/localvault-e2e.sqlite",
            VAULT_PASSWORD_PREFIX: "test-",
        },
        reuseExistingServer: false,
    },
});
