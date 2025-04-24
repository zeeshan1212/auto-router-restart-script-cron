# Router Auto Reset Script

An automated Node.js script to reset a Skyworth router on a daily schedule.

## Features

- Automated router reset at scheduled time (default: 6 AM daily)
- Headless browser automation using Puppeteer
- Progress monitoring with screenshots
- Error handling and logging
- Support for confirmation dialogs
- Reboot progress tracking
- Router recovery verification

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

Edit the `routerConfig` object in `router-reset.js` to match your router settings:

```javascript
const routerConfig = {
    url: 'http://192.168.1.1',
    username: 'admin',
    password: 'your_password'
};
```

## Usage

### Test Mode
To test the script immediately:
```bash
node router-reset.js --test
```

### Scheduled Mode
To run the script in scheduled mode (resets at 6 AM daily):
```bash
node router-reset.js
```

## Screenshots

The script takes several screenshots during the process:
- `router-login.png`: Initial login page
- `router-logged-in.png`: After successful login
- `router-status.png`: Status page
- `router-reboot-progress-*.png`: Series of reboot progress screenshots
- `router-reboot-complete.png`: Final reboot completion
- `router-back-online.png`: Router back online verification
- `router-error.png`: Any error states (if they occur)

## Error Handling

The script includes comprehensive error handling and will:
- Log all steps and errors
- Take screenshots at error points
- Handle network disconnections during reboot
- Verify router recovery after reboot

## Security Note

Please ensure to:
- Keep your router password secure
- Don't share the configured script with others
- Consider using environment variables for sensitive information 