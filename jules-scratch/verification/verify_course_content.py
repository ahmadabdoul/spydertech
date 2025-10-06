import os
import json
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    # JSON data to be returned by the mocked fetch
    course_content_data = {
        "course_details": {"title": "Introduction to Programming", "certificate_fee": "0.00"},
        "course_contents": [
            {"id": 1, "course_id": 1, "title": "Getting Started with Programming", "chapter_title": None, "content": "Introduction to programming concepts", "video_type": "url", "video_url": "https://..."},
            {"id": 2, "course_id": 1, "title": "Variables and Data Types", "chapter_title": None, "content": "Learn about variables and data types", "video_type": "url", "video_url": "https://..."}
        ],
        "questions_answers": [], "status": 0, "message": "Course content fetched successfully."
    }
    course_progress_data = {"status": 0, "progress": []}

    # This script will be injected into the page before its own scripts run.
    # It overrides the global fetch() function.
    mock_fetch_script = f"""
    const originalFetch = window.fetch;
    window.fetch = async (url, options) => {{
        console.log(`Intercepted fetch call to: ${{url}}`);
        if (url.includes('get-course-content.php')) {{
            console.log('Returning mock course content...');
            return Promise.resolve(new Response(JSON.stringify({json.dumps(course_content_data)}), {{
                status: 200,
                headers: {{ 'Content-Type': 'application/json' }}
            }}));
        }}
        if (url.includes('get_course_progress.php')) {{
            console.log('Returning mock course progress...');
            return Promise.resolve(new Response(JSON.stringify({json.dumps(course_progress_data)}), {{
                status: 200,
                headers: {{ 'Content-Type': 'application/json' }}
            }}));
        }}
        // Fallback to the original fetch for any other request.
        return originalFetch(url, options);
    }};
    """

    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Inject the mock script. This is the key to solving the file:// fetch issue.
    page.add_init_script(mock_fetch_script)

    # Navigate to the dummy page first to establish a valid origin for storage.
    dummy_page_path = "file://" + os.path.abspath("jules-scratch/verification/dummy.html")
    page.goto(dummy_page_path)

    # Now that we are on a page with a valid origin, set the storage.
    page.evaluate("() => { localStorage.setItem('url', './'); sessionStorage.setItem('user', JSON.stringify({id: 1})); }")

    # Now, navigate to the actual page. The init script will run, mocking fetch.
    # The page's own JS will then execute and use our mocked fetch.
    page.goto("file://" + os.path.abspath("student/course-content.html") + "?course=1")

    # Assertions should now pass because the data is loaded correctly.
    expect(page.locator("#chapter-sidebar-list").get_by_text("General")).to_be_visible(timeout=10000)
    expect(page.locator("#chapters-container").get_by_text("Getting Started with Programming")).to_be_visible()
    expect(page.locator("#chapters-container").get_by_text("Variables and Data Types")).to_be_visible()

    # Final visual confirmation
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)