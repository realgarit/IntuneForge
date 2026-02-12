from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            page.goto("http://localhost:5173")
            page.wait_for_selector("text=Browse Catalog")
            page.click("text=Browse Catalog")
            page.wait_for_selector("text=Application Catalog")
            time.sleep(1)

            # Filter Browsers
            if page.locator("button:has-text('Browsers')").count() > 0:
                page.click("button:has-text('Browsers')")
                time.sleep(1)

            # Debug Firefox Selection
            print("Selecting Firefox...")
            # Get all cards that match
            cards = page.locator("div.border").filter(has_text="Mozilla Firefox").all()
            print(f"Found {len(cards)} Firefox cards")

            for card in cards:
                if card.is_visible():
                    print("Found visible Firefox card")
                    # Find checkbox
                    checkboxes = card.locator(".h-5.w-5.rounded.border").all()
                    for cb in checkboxes:
                        if cb.is_visible():
                            cb.click()
                            print("Clicked visible checkbox for Firefox")

            time.sleep(0.5)

            # Debug Chrome Selection
            print("Selecting Chrome...")
            cards_c = page.locator("div.border").filter(has_text="Google Chrome").all()
            for card in cards_c:
                if card.is_visible():
                    checkboxes = card.locator(".h-5.w-5.rounded.border").all()
                    for cb in checkboxes:
                        if cb.is_visible():
                            cb.click()
                            print("Clicked visible checkbox for Chrome")

            time.sleep(1)

            page.screenshot(path="verification_visible_click.png")

            add_btn = page.locator("button", has_text="Add 2 Selected")
            if add_btn.is_visible():
                print("Add button visible!")
                add_btn.click()
                time.sleep(1)
                page.screenshot(path="verification_final.png")
                # Verify sidebar
                sidebar = page.locator("aside")
                if sidebar.get_by_text("Mozilla Firefox").count() > 0:
                    print("SUCCESS: Mozilla Firefox found in sidebar")
                else:
                    print("FAILURE: Mozilla Firefox NOT found in sidebar")
            else:
                print("Add button NOT visible")

        except Exception as e:
            print(f"Error: {e}")

        finally:
            browser.close()

if __name__ == "__main__":
    run()
