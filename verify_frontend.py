from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:5173")

        # Click "Browse Catalog"
        page.get_by_role("button", name="Browse Catalog").click()

        # Verify dialog opens
        expect(page.get_by_role("dialog")).to_be_visible()

        # Verify Categories sidebar
        expect(page.get_by_text("Categories")).to_be_visible()
        expect(page.get_by_role("button", name="Browsers")).to_be_visible()

        # Verify checkboxes
        # Wait a bit for list to render
        page.wait_for_timeout(1000)

        # Select first app (7-Zip) by clicking the text or container
        # The text might be "7-Zip 23.01 (x64)" so "7-Zip" is partial match.
        page.locator("text=7-Zip").first.click()

        # Select second app (Firefox)
        page.locator("text=Firefox").first.click()

        # Verify "Add 2 to Library" button appears
        # It might be "Add 2 apps to Library" or similar based on my code: "Add {selectedApps.length} to Library"
        # Since I clicked 2, it should be "Add 2 to Library"
        add_btn = page.get_by_role("button", name="Add 2 to Library")
        expect(add_btn).to_be_visible()

        # Screenshot the catalog with selection
        page.screenshot(path="catalog_selection.png")

        # Click Add
        add_btn.click()

        # Verify dialog closes
        expect(page.get_by_role("dialog")).not_to_be_visible()

        # Verify sidebar updated with new configs
        # Sidebar has "Saved Packages"
        expect(page.get_by_text("Saved Packages")).to_be_visible()
        expect(page.locator("aside").get_by_text("7-Zip").first).to_be_visible()

        # Click on 7-Zip in sidebar
        page.locator("aside").get_by_text("7-Zip").first.click()

        # Verify FileUploader shows URL tab
        # The tab triggers have role="tab". The active one has data-state="active".
        expect(page.get_by_role("tab", name="URL Download")).to_have_attribute("data-state", "active")

        # Verify Download button exists
        expect(page.get_by_role("button", name="Download")).to_be_visible()

        # Screenshot the result
        page.screenshot(path="result_view.png")

        browser.close()

if __name__ == "__main__":
    run()
