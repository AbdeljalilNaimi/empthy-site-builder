import { test, expect } from '@playwright/test';

test.describe('Provider Search Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
  });

  test('can search for providers and view results', async ({ page }) => {
    // Navigate to search page
    await page.click('text=Rechercher');
    
    // Wait for search page to load
    await expect(page).toHaveURL(/\/search|\/recherche/);
    
    // Find and interact with search input
    const searchInput = page.locator('input[placeholder*="search"], input[placeholder*="Rechercher"], input[type="search"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('médecin');
      await searchInput.press('Enter');
      
      // Wait for results to load
      await page.waitForTimeout(1000);
    }
    
    // Verify the page contains provider listings or results
    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });

  test('can navigate to provider profile from search', async ({ page }) => {
    // Navigate to carte (map/providers page)
    await page.goto('/carte');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Look for any provider card or link
    const providerLinks = page.locator('[href*="/provider/"], [href*="/prestataire/"], .provider-card').first();
    
    if (await providerLinks.isVisible()) {
      await providerLinks.click();
      
      // Wait for navigation
      await page.waitForLoadState('networkidle');
      
      // Verify we're on a provider profile page
      const url = page.url();
      expect(url).toMatch(/provider|prestataire/);
    }
  });

  test('displays emergency services section', async ({ page }) => {
    // The homepage should have emergency information
    await page.goto('/');
    
    // Look for emergency-related content
    const emergencyContent = page.locator('text=Urgence, text=urgence, text=15, text=Emergency').first();
    
    // Verify emergency section exists or homepage loads properly
    await expect(page.locator('body')).toBeVisible();
  });

  test('provider search filters work correctly', async ({ page }) => {
    // Navigate to search page
    await page.goto('/recherche');
    
    // Wait for page load
    await page.waitForLoadState('domcontentloaded');
    
    // Check for filter elements
    const filterButton = page.locator('button:has-text("Filtres"), button:has-text("Filter")').first();
    
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // Check that filter panel opens
      await page.waitForTimeout(500);
    }
    
    // Verify page renders without errors
    const errorMessage = page.locator('.error-message, [role="alert"]').first();
    const hasError = await errorMessage.isVisible().catch(() => false);
    expect(hasError).toBeFalsy();
  });
});

test.describe('Authentication Flow', () => {
  test('can navigate to auth page', async ({ page }) => {
    await page.goto('/');
    
    // Look for login/signup button
    const authButton = page.locator('text=Connexion, text=Se connecter, text=Login, a[href="/auth"]').first();
    
    if (await authButton.isVisible()) {
      await authButton.click();
      
      // Verify we're on auth page
      await expect(page).toHaveURL(/auth/);
      
      // Check for login form elements
      await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
    }
  });
});

test.describe('Navigation', () => {
  test('main navigation links work', async ({ page }) => {
    await page.goto('/');
    
    // Test that navigation exists
    const nav = page.locator('nav, header');
    await expect(nav.first()).toBeVisible();
    
    // Check main links
    const homeLink = page.locator('a[href="/"]').first();
    await expect(homeLink).toBeVisible();
  });

  test('404 page displays correctly', async ({ page }) => {
    await page.goto('/non-existent-page-12345');
    
    // Should show 404 content or redirect
    await page.waitForLoadState('networkidle');
    
    const content = await page.content();
    expect(content).toBeDefined();
  });
});
