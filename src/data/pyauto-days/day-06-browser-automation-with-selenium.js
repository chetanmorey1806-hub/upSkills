export default {
  id: "day-06-browser-automation-with-selenium",
  title: "Browser Automation with Selenium",
  module: "Module 2: Web & APIs",
  day: 6,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Control a real Chrome or Firefox browser from Python with Selenium 4: open pages, find elements with locators, fill and submit forms, wait for dynamic content, take screenshots and run headless. Use it for testing and for automating repetitive web tasks on sites you are allowed to automate.",
  objectives: [
    "Install Selenium 4 and start a browser with Selenium Manager (no manual driver download)",
    "Locate elements with By.ID, By.NAME, By.CSS_SELECTOR and By.XPATH",
    "Fill forms, click buttons, handle dropdowns and read results",
    "Use explicit waits instead of time.sleep() for dynamic pages",
    "Take screenshots, run in headless mode and close the browser safely",
  ],
  theory: [
    {
      heading: "What is Selenium and When to Use It?",
      content: "Selenium drives a real web browser through the WebDriver protocol. Everything a user can do (click, type, scroll, select, upload) your script can do. It is the standard tool for automated UI testing and is also used to automate web portals that have no API, for example downloading a daily report from an internal dashboard.\n\nSelenium is slower and heavier than requests, so use it only when needed: pages built with JavaScript, multi-step logins, or interactions like clicking buttons. If the site has an API or the data is in the raw HTML, use requests/BeautifulSoup instead.",
      points: [
        "pip install selenium   (Selenium 4.6+ includes Selenium Manager, which downloads the matching ChromeDriver automatically)",
        "You still need the browser itself installed (Chrome, Edge or Firefox)",
        "Same ethics as scraping: follow terms of service and robots.txt, never automate CAPTCHAs, bulk sign-ups or other people's accounts",
        "Alternatives: Playwright (modern, auto-waiting, fast) and pyppeteer",
      ],
    },
    {
      heading: "Starting the Browser",
      content: "Create a driver object, open a URL with `driver.get()`, and always close it with `driver.quit()` (which also stops the driver process). Using try/finally or a `with` block guarantees cleanup even if your script fails halfway. Options let you run headless (no window), set the window size, or disable notifications.",
      syntax: `from selenium import webdriver
from selenium.webdriver.chrome.options import Options

opts = Options()
opts.add_argument("--headless=new")          # no visible window
opts.add_argument("--window-size=1366,768")

driver = webdriver.Chrome(options=opts)       # Selenium Manager finds the driver
try:
    driver.get("https://example.com")
    print(driver.title, driver.current_url)
finally:
    driver.quit()
`,
      tip: "driver.close() closes only the current tab; driver.quit() closes everything and ends the session. Use quit() at the end.",
    },
    {
      heading: "Locators: Finding Elements",
      content: "Use `driver.find_element(By.<STRATEGY>, value)` for one element (raises `NoSuchElementException` if missing) and `find_elements()` for a list (empty list if missing). The old `find_element_by_id()` style methods were removed in Selenium 4.3, so always import `By`.",
      syntax: `from selenium.webdriver.common.by import By

driver.find_element(By.ID, "username")
driver.find_element(By.NAME, "email")
driver.find_element(By.CLASS_NAME, "btn-primary")      # a single class only
driver.find_element(By.CSS_SELECTOR, "form#login button[type='submit']")
driver.find_element(By.XPATH, "//button[text()='Login']")
driver.find_element(By.LINK_TEXT, "Forgot password?")
driver.find_elements(By.CSS_SELECTOR, "table tr")       # list
`,
      points: [
        "Priority: ID > NAME > CSS selector > XPath (IDs are fastest and most stable)",
        "XPath can search by visible text and move to parent elements, which CSS cannot",
        "Test selectors in DevTools Console: $$(\"css\") or $x(\"//xpath\")",
      ],
    },
    {
      heading: "Interacting: Click, Type, Select, Read",
      content: "WebElement methods: `send_keys()` types text, `clear()` empties an input, `click()` clicks, `submit()` submits a form, `.text` returns visible text and `get_attribute(\"value\")` reads attributes. For `<select>` dropdowns use the `Select` helper. Special keys come from `Keys` (ENTER, TAB, CONTROL).",
      syntax: `from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select

box = driver.find_element(By.NAME, "q")
box.clear()
box.send_keys("python automation", Keys.ENTER)

Select(driver.find_element(By.ID, "state")).select_by_visible_text("Maharashtra")
checkbox = driver.find_element(By.ID, "terms")
if not checkbox.is_selected():
    checkbox.click()
print(driver.find_element(By.CSS_SELECTOR, ".result").text)
`,
    },
    {
      heading: "Waits: Implicit vs Explicit",
      content: "Modern pages load content after the initial page load. If your script looks for an element too early you get `NoSuchElementException`. `time.sleep(5)` is a bad fix: too short on a slow day, too long on a fast day. Use an **explicit wait**: `WebDriverWait` polls until a condition is true or a timeout expires (`TimeoutException`). An **implicit wait** (`driver.implicitly_wait(10)`) applies to every find_element call; do not mix it with explicit waits because timeouts can add up unpredictably.",
      syntax: `from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

wait = WebDriverWait(driver, 10)
btn = wait.until(EC.element_to_be_clickable((By.ID, "submit")))
msg = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".alert")))
wait.until(EC.url_contains("/dashboard"))
wait.until(EC.text_to_be_present_in_element((By.ID, "status"), "Done"))
`,
      tip: "Note the double parentheses: the locator is passed as one tuple (By.ID, 'submit').",
    },
    {
      heading: "Screenshots, Headless Mode and Good Practice",
      content: "`driver.save_screenshot(\"page.png\")` captures the visible window and `element.screenshot(\"chart.png\")` captures one element: useful for reports and for debugging failures in scheduled jobs. Headless mode runs without a window and is required on servers. Set a window size in headless mode, because the default can be small and change the page layout.",
      points: [
        "Wrap the whole flow in try/finally and take a screenshot in except to see what went wrong",
        "Never hardcode passwords: read them from environment variables",
        "Store page-specific selectors in one place (Page Object Model) to keep scripts maintainable",
        "Switch frames with driver.switch_to.frame(...) and tabs with driver.switch_to.window(handle)",
        "Handle JavaScript alerts with driver.switch_to.alert.accept()",
      ],
    },
  ],
  examples: [
    {
      title: "Open a Page, Read the Title and Take a Screenshot",
      scenario: "Verify that a website is up every morning and keep a screenshot as proof.",
      steps: [
        "Install: pip install selenium",
        "Make sure Google Chrome is installed (Selenium Manager downloads the driver automatically)",
        "Run: python main.py",
        "Open homepage.png to see the captured page",
      ],
      code: `from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

opts = Options()
opts.add_argument("--headless=new")
opts.add_argument("--window-size=1366,768")

driver = webdriver.Chrome(options=opts)
try:
    driver.get("https://example.com")
    print("Title:", driver.title)
    print("URL:", driver.current_url)
    name = f"homepage_{datetime.now():%Y%m%d}.png"
    driver.save_screenshot(name)
    print("Saved", name)
finally:
    driver.quit()
`,
      result: `Title: Example Domain
URL: https://example.com/
Saved homepage_20251118.png
(the date in the file name will be today's date)`,
      explanation: "Options configures Chrome: '--headless=new' is the modern headless mode and the window size gives a predictable layout. webdriver.Chrome() starts the browser; Selenium Manager resolves the driver. driver.get() waits for the page load event. try/finally guarantees driver.quit() runs, so no Chrome processes are left running in the background.",
    },
    {
      title: "Log In to a Practice Site with a Form",
      scenario: "Automate a login flow on the-internet.herokuapp.com, a public site built for automation practice, and verify the success message.",
      steps: [
        "Install: pip install selenium",
        "The practice credentials are public: tomsmith / SuperSecretPassword!",
        "For real sites read the password from an environment variable instead",
        "Run: python main.py",
      ],
      code: `import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

USER = os.getenv("DEMO_USER", "tomsmith")
PASSWORD = os.getenv("DEMO_PASS", "SuperSecretPassword!")

driver = webdriver.Chrome()
wait = WebDriverWait(driver, 10)
try:
    driver.get("https://the-internet.herokuapp.com/login")
    driver.find_element(By.ID, "username").send_keys(USER)
    driver.find_element(By.ID, "password").send_keys(PASSWORD)
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    flash = wait.until(EC.visibility_of_element_located((By.ID, "flash")))
    print("Message:", flash.text.splitlines()[0])
    print("On secure page:", "/secure" in driver.current_url)
except Exception:
    driver.save_screenshot("login_error.png")
    raise
finally:
    driver.quit()
`,
      result: `Message: You logged into a secure area!
On secure page: True`,
      explanation: "IDs are the most reliable locators. send_keys() types into inputs and click() submits. The flash message appears after navigation, so we use an explicit wait for its visibility. Its text ends with a close button symbol, so splitlines()[0] keeps only the message. On any error a screenshot is saved for debugging before the exception is re-raised.",
    },
    {
      title: "Explicit Wait for Dynamically Loaded Content",
      scenario: "Some pages show a loading spinner and insert the result a few seconds later. Wait correctly instead of sleeping.",
      steps: [
        "Install: pip install selenium",
        "Run: python main.py",
        "Try replacing the wait with a direct find_element() to see NoSuchElementException",
      ],
      code: `import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

opts = webdriver.ChromeOptions()
opts.add_argument("--headless=new")
driver = webdriver.Chrome(options=opts)
try:
    driver.get("https://the-internet.herokuapp.com/dynamic_loading/2")
    driver.find_element(By.CSS_SELECTOR, "#start button").click()
    start = time.perf_counter()
    try:
        finish = WebDriverWait(driver, 15).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "#finish h4"))
        )
        print("Text:", finish.text)
        print(f"Waited about {time.perf_counter() - start:.0f} seconds")
    except TimeoutException:
        print("Content did not load within 15 seconds")
finally:
    driver.quit()
`,
      result: `Text: Hello World!
Waited about 5 seconds`,
      explanation: "After clicking Start, the page shows a loading bar and adds #finish h4 roughly 5 seconds later. WebDriverWait polls every 0.5 seconds (default) and returns the element as soon as it is visible, so we never wait longer than necessary. If it never appears, TimeoutException is raised and handled with a clear message.",
    },
    {
      title: "Scrape a JavaScript-Rendered Page",
      scenario: "quotes.toscrape.com/js/ builds its quotes with JavaScript, so requests sees no quotes. Use Selenium to render the page, then collect quotes from 2 pages.",
      steps: [
        "Install: pip install selenium",
        "First try requests.get('https://quotes.toscrape.com/js/').text and notice the quotes are not in the HTML as elements",
        "Run: python main.py",
      ],
      code: `import csv
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

opts = webdriver.ChromeOptions()
opts.add_argument("--headless=new")
driver = webdriver.Chrome(options=opts)
wait = WebDriverWait(driver, 10)
rows = []
try:
    driver.get("https://quotes.toscrape.com/js/")
    for page in range(1, 3):
        wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "div.quote")))
        for q in driver.find_elements(By.CSS_SELECTOR, "div.quote"):
            rows.append({
                "text": q.find_element(By.CSS_SELECTOR, "span.text").text,
                "author": q.find_element(By.CSS_SELECTOR, "small.author").text,
            })
        print(f"Page {page}: {len(rows)} quotes so far")
        nxt = driver.find_elements(By.CSS_SELECTOR, "li.next a")
        if not nxt:
            break
        nxt[0].click()
        time.sleep(1)          # polite pause between pages
finally:
    driver.quit()

with open("js_quotes.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=["text", "author"])
    w.writeheader()
    w.writerows(rows)
print("First author:", rows[0]["author"])
`,
      result: `Page 1: 10 quotes so far
Page 2: 20 quotes so far
First author: Albert Einstein`,
      explanation: "The real browser runs the page's JavaScript, so the div.quote elements exist in the DOM. We wait for them, read child elements relative to each quote (q.find_element), and click the Next link. find_elements() returns an empty list instead of raising, which makes 'is there a next page?' checks easy. Data is saved to CSV after the browser is closed.",
    },
    {
      title: "Dropdowns, Checkboxes and Element Screenshots",
      scenario: "Select an option from a dropdown, tick checkboxes and capture a screenshot of just one element for a test report.",
      steps: [
        "Install: pip install selenium",
        "Run: python main.py",
        "Open dropdown.png to see the element-only screenshot",
      ],
      code: `from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select

opts = webdriver.ChromeOptions()
opts.add_argument("--headless=new")
opts.add_argument("--window-size=1280,800")
driver = webdriver.Chrome(options=opts)
try:
    driver.get("https://the-internet.herokuapp.com/dropdown")
    dropdown = Select(driver.find_element(By.ID, "dropdown"))
    print("Options:", [o.text for o in dropdown.options])
    dropdown.select_by_visible_text("Option 2")
    print("Selected:", dropdown.first_selected_option.text)
    driver.find_element(By.ID, "dropdown").screenshot("dropdown.png")

    driver.get("https://the-internet.herokuapp.com/checkboxes")
    boxes = driver.find_elements(By.CSS_SELECTOR, "#checkboxes input")
    for box in boxes:
        if not box.is_selected():
            box.click()
    print("All checked:", all(b.is_selected() for b in boxes))
finally:
    driver.quit()
`,
      result: `Options: ['Please select an option', 'Option 1', 'Option 2']
Selected: Option 2
All checked: True`,
      explanation: "Select wraps a <select> element and offers select_by_visible_text, select_by_value and select_by_index. first_selected_option confirms the choice. element.screenshot() saves only that element. For checkboxes we click only those not already selected, so the script is idempotent.",
    },
  ],
  interview: [
    { q: "What is Selenium WebDriver?", a: "A W3C-standard API and protocol to control real browsers programmatically. Your Python code talks to a browser driver (ChromeDriver, GeckoDriver), which controls the browser. It is mainly used for UI test automation and for automating browser tasks.", level: "Easy" },
    { q: "What is Selenium Manager?", a: "A tool bundled with Selenium 4.6+ that automatically detects the installed browser version and downloads the matching driver. You no longer need webdriver-manager or manual ChromeDriver downloads in most setups.", level: "Medium" },
    { q: "Difference between find_element and find_elements?", a: "find_element returns the first matching WebElement and raises NoSuchElementException if none is found. find_elements returns a list of all matches, or an empty list if none, never raising.", level: "Easy" },
    { q: "Implicit wait vs explicit wait vs time.sleep?", a: "time.sleep pauses for a fixed time regardless of the page state (slow and flaky). Implicit wait sets a global timeout for all element lookups. Explicit wait (WebDriverWait + expected_conditions) waits for a specific condition on a specific element and is the recommended approach. Avoid mixing implicit and explicit waits.", level: "Medium" },
    { q: "When would you choose XPath over CSS selectors?", a: "When you need to locate by visible text (//button[text()='Save']), move to a parent or ancestor (/..  or ancestor::), or use complex conditions. CSS selectors are usually shorter and faster for id/class/attribute-based selection.", level: "Medium" },
    { q: "What is a StaleElementReferenceException and how do you fix it?", a: "It occurs when a previously found element is no longer attached to the DOM, for example after the page reloads or a list re-renders. Fix by finding the element again after the change, or waiting for the new element with an explicit wait.", level: "Hard" },
    { q: "driver.close() vs driver.quit()?", a: "close() closes the current window/tab. quit() closes all windows and ends the WebDriver session, stopping the driver process. Always call quit() in a finally block.", level: "Easy" },
    { q: "How do you run Selenium on a Linux server without a display?", a: "Use headless mode (--headless=new for Chrome), set an explicit window size, and install the browser on the server. Docker images such as selenium/standalone-chrome also work well, especially with Selenium Grid.", level: "Medium" },
    { q: "How do you handle an iframe or a new browser tab?", a: "For iframes: driver.switch_to.frame(element_or_name), then switch_to.default_content() to return. For tabs: save driver.current_window_handle, loop over driver.window_handles and call switch_to.window(handle).", level: "Medium" },
    { q: "What is the Page Object Model?", a: "A design pattern where each page is a class that stores its locators and exposes actions (login(), search()). Tests call these methods instead of using raw locators, so when the UI changes you update one class. It improves readability and maintenance.", level: "Hard" },
    { q: "Can you automate CAPTCHA with Selenium?", a: "You should not. CAPTCHAs exist specifically to block bots, and bypassing them violates terms of service. In testing environments, ask developers to disable CAPTCHA or use test keys; for data, request API access.", level: "Medium" },
    { q: "Why is Selenium slower than requests for scraping and how do you decide?", a: "Selenium starts a full browser, downloads all assets and runs JavaScript. requests fetches only the HTML/JSON. Use requests when the data is in the HTML or a JSON endpoint; use Selenium/Playwright only when you need real interaction or JavaScript rendering.", level: "Medium" },
  ],
  practice: [
    {
      task: "Open https://the-internet.herokuapp.com/ and print the text of all links on the page using find_elements.",
      hint: "By.CSS_SELECTOR 'ul li a' and the .text property.",
      solution: `from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
try:
    driver.get("https://the-internet.herokuapp.com/")
    links = driver.find_elements(By.CSS_SELECTOR, "ul li a")
    for a in links:
        print(a.text)
    print(len(links), "links")
finally:
    driver.quit()
`,
    },
    {
      task: "Log in at https://the-internet.herokuapp.com/login with a wrong password and print the error message.",
      hint: "Wait for #flash to be visible and print its first line.",
      solution: `from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()
try:
    driver.get("https://the-internet.herokuapp.com/login")
    driver.find_element(By.ID, "username").send_keys("tomsmith")
    driver.find_element(By.ID, "password").send_keys("wrong")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    flash = WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "flash")))
    print(flash.text.splitlines()[0])   # Your password is invalid!
finally:
    driver.quit()
`,
    },
    {
      task: "Write a helper wait_and_click(driver, css, timeout=10) that waits until an element is clickable, clicks it and returns it.",
      hint: "EC.element_to_be_clickable((By.CSS_SELECTOR, css)).",
      solution: `from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def wait_and_click(driver, css, timeout=10):
    el = WebDriverWait(driver, timeout).until(EC.element_to_be_clickable((By.CSS_SELECTOR, css)))
    el.click()
    return el
`,
    },
    {
      task: "Read the table on https://the-internet.herokuapp.com/tables (table#table1) and print the Last Name and Due columns for every row.",
      hint: "Loop over 'table#table1 tbody tr' and read td cells by index (0 = Last Name, 3 = Due).",
      solution: `from selenium import webdriver
from selenium.webdriver.common.by import By

opts = webdriver.ChromeOptions()
opts.add_argument("--headless=new")
driver = webdriver.Chrome(options=opts)
try:
    driver.get("https://the-internet.herokuapp.com/tables")
    for tr in driver.find_elements(By.CSS_SELECTOR, "table#table1 tbody tr"):
        tds = tr.find_elements(By.TAG_NAME, "td")
        print(tds[0].text, tds[3].text)
finally:
    driver.quit()
`,
    },
  ],
  quiz: [
    { question: "Which import is needed for find_element(By.ID, 'x')?", options: ["from selenium.webdriver import By", "from selenium.webdriver.common.by import By", "from selenium.by import By", "No import, By is built in"], answer: 1, explanation: "By lives in selenium.webdriver.common.by." },
    { question: "What does find_elements() return when nothing matches?", options: ["None", "Raises NoSuchElementException", "An empty list", "False"], answer: 2, explanation: "find_elements never raises for no match; it returns []." },
    { question: "Which is the recommended way to wait for a dynamic element?", options: ["time.sleep(10)", "WebDriverWait with expected_conditions", "driver.refresh() in a loop", "input('press enter')"], answer: 1, explanation: "Explicit waits poll until a condition is met, without fixed delays." },
    { question: "Which Chrome argument enables modern headless mode?", options: ["--no-window", "--headless=new", "--hidden", "--silent"], answer: 1, explanation: "--headless=new runs the full Chrome engine without a visible window." },
    { question: "What should be in the finally block of a Selenium script?", options: ["driver.get()", "driver.quit()", "driver.refresh()", "time.sleep()"], answer: 1, explanation: "quit() ensures the browser and driver processes are always closed." },
    { question: "Which helper is used to choose an option in a <select> element?", options: ["Dropdown", "Select", "Option", "Choice"], answer: 1, explanation: "selenium.webdriver.support.ui.Select provides select_by_visible_text and similar methods." },
  ],
};
