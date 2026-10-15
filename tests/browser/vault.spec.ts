import { test, expect } from "@playwright/test";
test("manage credentials and generate passwords", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width: 1440, height: 1050 });
    await page.goto("/");
    await expect(
        page.getByRole("heading", { name: "Your digital life, all together." }),
    ).toBeVisible();
    await page.screenshot({
        path: "test-results/dashboard-desktop.png",
        fullPage: true,
    });
    await page
        .getByRole("button", { name: "Add your first account", exact: true })
        .click();
    await page.getByLabel("Site name").fill("Browser test account");
    await page.getByLabel("Website URL").fill("https://example.com");
    await page.getByLabel("Username", { exact: true }).fill("test-user");
    await page.getByLabel("Email address").fill("user@example.com");
    await page.getByRole("button", { name: "Generate", exact: true }).click();
    const original = await page.locator("#password").inputValue();
    expect(original.length).toBe(20);
    expect(original).toMatch(/^test-/);
    await page
        .getByRole("button", { name: "Save account", exact: true })
        .click();
    await expect(
        page
            .locator(".account-name")
            .filter({ hasText: "Browser test account" }),
    ).toBeVisible();
    await page.reload();
    await page
        .getByRole("button", { name: "Edit Browser test account", exact: true })
        .click();
    await page
        .getByRole("button", { name: "Current password", exact: true })
        .click();
    await expect(page.locator(".secret")).toHaveText(original);
    await page.getByRole("button", { name: "Generate", exact: true }).click();
    const replacement = await page.locator("#password").inputValue();
    expect(replacement).not.toBe(original);
    expect(replacement).toMatch(/^test-/);
    await page
        .getByRole("button", { name: "Save changes", exact: true })
        .click();
    await page
        .getByRole("button", {
            name: "Favorite Browser test account",
            exact: true,
        })
        .click();
    await page
        .getByRole("button", { name: "Favorites", exact: false })
        .first()
        .click();
    await expect(
        page
            .locator(".account-name")
            .filter({ hasText: "Browser test account" }),
    ).toBeVisible();
    await page
        .getByLabel("Search accounts", { exact: true })
        .fill("nonexistent");
    await expect(
        page.getByRole("heading", { name: "No accounts found." }),
    ).toBeVisible();
    await page.getByLabel("Search accounts", { exact: true }).fill("");
    await page.getByRole("button", { name: "Grid view" }).click();
    await page
        .getByRole("button", { name: "Browser test account", exact: true })
        .click();
    await page
        .getByRole("button", { name: "Current password", exact: true })
        .click();
    await expect(page.locator(".secret")).toHaveText(replacement);
    await page
        .getByRole("button", { name: "Delete account", exact: true })
        .click();
    await page
        .getByRole("dialog")
        .last()
        .getByRole("button", { name: "Delete account", exact: true })
        .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("button", { name: "Password generator" }).click();
    await page.getByLabel("Password length").fill("32");
    await expect(page.locator("output")).toHaveText(/^test-.{27}$/);
    await page.getByLabel("Uppercase letters").uncheck();
    await expect(page.locator("output")).not.toHaveText(/[A-Z]/);
    await page.screenshot({
        path: "test-results/password-generator.png",
        fullPage: true,
    });
    expect(errors).toEqual([]);
});
test("mobile dashboard fits and navigation works", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(
        page.getByRole("heading", { name: "Your digital life, all together." }),
    ).toBeVisible();
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
        ),
    ).toBe(true);
    await page.screenshot({
        path: "test-results/dashboard-mobile.png",
        fullPage: true,
    });
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("button", { name: "Password generator" }).click();
    await expect(
        page.getByRole("heading", { name: "A stronger starting point." }),
    ).toBeVisible();
});
