import asyncio
import json
import random
import logging
from playwright.async_api import async_playwright

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Rule 3: User-Agent Rotation
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
]

async def scrape():
    output_file = "raw_salaries.jsonl"
    
    async with async_playwright() as p:
        ua = random.choice(USER_AGENTS)
        logging.info(f"Assigned User-Agent: {ua[:50]}...")
        
        # Rule 1: Headless Playwright
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent=ua)
        page = await context.new_page()
        
        target_url = "file:///C:/Users/abhay/OneDrive/Desktop/TalentDash/talent-dash/mock.html"
        logging.info(f"Navigating to {target_url}")
        await page.goto(target_url)
        
        # Rule 2: Mandatory Rate Limiting Jitter (1.5 - 4.0 seconds)
        jitter = random.uniform(1.5, 4.0)
        logging.info(f"Enforcing jitter rate limit: sleeping for {jitter:.2f}s...")
        await asyncio.sleep(jitter)
        
        rows = await page.locator('.salary-row').all()
        logging.info(f"Found {len(rows)} potential records. Beginning extraction.")
        
        success_count = 0
        error_count = 0
        
        with open(output_file, 'w', encoding='utf-8') as f:
            for i, row in enumerate(rows):
                try:
                    # Rule 5: Exact Output Contract
                    raw_company = await row.locator('.company').text_content(timeout=1000)
                    raw_role = await row.locator('.role').text_content(timeout=1000)
                    raw_salary_text = await row.locator('.salary').text_content(timeout=1000)
                    raw_location = await row.locator('.location').text_content(timeout=1000)
                    raw_experience = await row.locator('.experience').text_content(timeout=1000)
                    
                    data = {
                        "raw_company": raw_company.strip() if raw_company else "",
                        "raw_role": raw_role.strip() if raw_role else "",
                        "raw_salary_text": raw_salary_text.strip() if raw_salary_text else "",
                        "raw_location": raw_location.strip() if raw_location else "",
                        "raw_experience": raw_experience.strip() if raw_experience else ""
                    }
                    
                    # Output JSONL
                    f.write(json.dumps(data) + '\n')
                    success_count += 1
                    
                except Exception as e:
                    # Rule 4: Fault Tolerance
                    logging.warning(f"Row {i} extraction failed (missing node). Continuing...")
                    error_count += 1
                    continue
        
        await browser.close()
        logging.info(f"Extraction complete. Success: {success_count} | Failed: {error_count}")

if __name__ == "__main__":
    asyncio.run(scrape())
