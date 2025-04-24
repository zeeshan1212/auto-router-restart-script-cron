const cron = require('node-cron');
const puppeteer = require('puppeteer');

const routerConfig = {
    url: process.env.ROUTER_URL || 'http://192.168.1.1',
    username: process.env.ROUTER_USERNAME || 'admin',
    password: process.env.ROUTER_PASSWORD // Password must be provided via environment variable
};

// Validate required environment variables
if (!process.env.ROUTER_PASSWORD) {
    console.error('Error: ROUTER_PASSWORD environment variable is required');
    process.exit(1);
}

// Helper function for delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to find elements by text content
async function findElementByText(page, selector, text) {
    const elements = await page.$$(selector);
    for (const element of elements) {
        const content = await page.evaluate(el => el.textContent, element);
        if (content && content.toLowerCase().includes(text.toLowerCase())) {
            return element;
        }
    }
    return null;
}

// Helper function to monitor reboot progress
async function monitorRebootProgress(page) {
    console.log('Monitoring reboot progress...');
    let progress = 0;
    let attempts = 0;
    const maxAttempts = 30; // Maximum 30 attempts (150 seconds)

    while (attempts < maxAttempts) {
        try {
            // Take a screenshot of the progress
            await page.screenshot({ path: `router-reboot-progress-${attempts}.png` });
            console.log(`Saved reboot progress screenshot ${attempts}`);

            // Try to find progress information on the page
            const content = await page.content();
            
            // Check if we see any progress indicators
            if (content.includes('100%') || content.toLowerCase().includes('reboot complete')) {
                console.log('Reboot completed successfully!');
                await page.screenshot({ path: 'router-reboot-complete.png' });
                return true;
            } else if (content.toLowerCase().includes('rebooting') || content.toLowerCase().includes('please wait')) {
                console.log('Router is still rebooting...');
            }

            // Wait 5 seconds before next check
            await delay(5000);
            attempts++;

        } catch (error) {
            console.log('Connection lost (this is expected during reboot)');
            // Wait a bit longer when connection is lost
            await delay(10000);
            attempts++;
        }
    }

    console.log('Reboot monitoring timed out after 150 seconds');
    return false;
}

async function resetRouter() {
    let browser = null;
    try {
        console.log('Launching browser...');
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        });

        console.log('Opening new page...');
        const page = await browser.newPage();

        // Set a reasonable viewport
        await page.setViewport({ width: 1280, height: 800 });

        // Navigate to the router login page
        console.log('Navigating to router login page...');
        await page.goto(routerConfig.url, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        console.log('Waiting for page to load...');
        await delay(2000);

        // Take a screenshot for debugging
        await page.screenshot({ path: 'router-login.png' });
        console.log('Saved screenshot as router-login.png');

        // Type username and password
        console.log('Entering credentials...');
        const usernameSelector = 'input[type="text"], input:not([type]), input[name="username"]';
        const passwordSelector = 'input[type="password"], input[name="password"]';
        
        await page.waitForSelector(usernameSelector, { timeout: 5000 })
            .then(() => page.type(usernameSelector, routerConfig.username))
            .catch(() => console.log('Username field not found with standard selectors'));

        await page.waitForSelector(passwordSelector, { timeout: 5000 })
            .then(() => page.type(passwordSelector, routerConfig.password))
            .catch(() => console.log('Password field not found with standard selectors'));

        // Click the login button
        console.log('Clicking login button...');
        let loginButton = await findElementByText(page, 'button, input[type="submit"], a', 'login');
        
        if (!loginButton) {
            // Try other common selectors
            const loginSelectors = [
                'input[type="submit"]',
                'button[type="submit"]',
                'input[value="Login"]',
                '.login-btn',
                '#login-btn'
            ];

            for (const selector of loginSelectors) {
                loginButton = await page.$(selector);
                if (loginButton) break;
            }
        }

        if (loginButton) {
            await loginButton.click();
            console.log('Successfully clicked login button');
        } else {
            console.log('Could not find login button, trying Enter key...');
            await page.keyboard.press('Enter');
        }

        // Wait for navigation after login
        console.log('Waiting for login to complete...');
        await delay(5000);

        // Take another screenshot after login
        await page.screenshot({ path: 'router-logged-in.png' });
        console.log('Saved post-login screenshot as router-logged-in.png');

        // Click on Status link
        console.log('Looking for Status link...');
        let statusLink = await page.$('a[href="RgSwInfo.asp"]');
        if (!statusLink) {
            // Try finding by text if href doesn't work
            statusLink = await findElementByText(page, 'a', 'Status');
        }

        if (statusLink) {
            console.log('Found Status link, clicking...');
            await statusLink.click();
            await delay(2000); // Wait for page to load
            console.log('Navigated to Status page');
            
            // Take a screenshot of the status page
            await page.screenshot({ path: 'router-status.png' });
            console.log('Saved status page screenshot as router-status.png');

            // Look for the reboot form and button
            console.log('Looking for reboot button...');
            
            // Wait for the form to be present
            await page.waitForSelector('form[action="/goform/RgSwInfo"]', { timeout: 5000 })
                .catch(() => console.log('Reboot form not found'));

            // Look for the reboot button with the specific style from the screenshot
            const rebootButton = await page.$('input[type="Submit"][value="Reboot"]');
            
            if (rebootButton) {
                console.log('Found reboot button, clicking...');
                await rebootButton.click();
                console.log('Clicked reboot button');
                
                // Wait for any confirmation dialog
                await delay(1000);
                
                // Handle any confirmation dialog if it appears
                try {
                    const confirmButton = await page.$('input[value="OK"], button[value="OK"]');
                    if (confirmButton) {
                        await confirmButton.click();
                        console.log('Confirmed reboot action');
                    }
                } catch (error) {
                    console.log('No confirmation dialog found or not needed');
                }
                
                console.log('Reboot command sent successfully');
                
                // Monitor the reboot progress
                await monitorRebootProgress(page);
                
                // After reboot completes or times out, try to verify router is back online
                console.log('Waiting for router to come back online...');
                await delay(30000); // Wait 30 seconds for router to fully restart
                
                try {
                    // Try to access the router again
                    await page.goto(routerConfig.url, {
                        waitUntil: 'networkidle0',
                        timeout: 30000
                    });
                    await page.screenshot({ path: 'router-back-online.png' });
                    console.log('Router is back online!');
                } catch (error) {
                    console.log('Could not verify if router is back online:', error.message);
                }
            } else {
                console.log('Could not find reboot button');
                console.log('Current page HTML:', await page.content());
            }
        } else {
            console.log('Could not find Status link');
            console.log('Current page content:', await page.content());
        }

    } catch (error) {
        console.error('Error during router reset:', error.message);
        if (browser) {
            try {
                const page = (await browser.pages())[0];
                if (page) {
                    await page.screenshot({ path: 'router-error.png' });
                    console.log('Saved error state screenshot as router-error.png');
                }
            } catch (screenshotError) {
                console.log('Failed to save error screenshot:', screenshotError.message);
            }
        }
    } finally {
        if (browser) {
            console.log('Closing browser...');
            await browser.close();
        }
    }
}

// Check if we're running in test mode
const isTestMode = process.argv.includes('--test');

if (isTestMode) {
    console.log('Running in test mode - executing reset immediately');
    resetRouter();
} else {
    // Schedule the reset to run every day at 6 AM
    cron.schedule('0 6 * * *', () => {
        console.log('Running scheduled router reset...');
        resetRouter();
    });
    console.log('Router reset scheduler started. Will run daily at 6 AM.');
    console.log('To test immediately, run: node router-reset.js --test');
} 