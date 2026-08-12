import { test, expect } from "@playwright/test";

test.describe("storefront smoke", () => {
  test("home page shows brand", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /ZAVÉLIA home|ZAVÉLIA/i }).first()).toBeVisible();
    await expect(page.getByText(/Elegance For Every You/i).first()).toBeVisible();
  });

  test("shop page loads", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByRole("heading", { name: "Shop" })).toBeVisible();
  });

  test("cart empty state", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.getByText(/cart is empty/i)).toBeVisible();
  });
});

test.describe("admin", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: /Admin sign in/i })).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
  });
});
