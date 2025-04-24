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
- Secure credential management using environment variables
- PM2 process management with detailed logging

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- PM2 (installed globally or as dev dependency)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Edit .env file with your router credentials
   ROUTER_URL=http://192.168.1.1
   ROUTER_USERNAME=admin
   ROUTER_PASSWORD=your_password_here
   ```

## Configuration

The script uses environment variables for configuration. You can set these in a `.env` file:

- `ROUTER_URL`: Your router's URL (default: http://192.168.1.1)
- `ROUTER_USERNAME`: Router login username (default: admin)
- `ROUTER_PASSWORD`: Router login password (required)

## Usage

### Using PM2 (Recommended)

PM2 provides process management, auto-restart, and detailed logging. The following npm scripts are available:

```bash
# Start the application with PM2
npm run pm2:start

# View logs
npm run pm2:logs

# Monitor the application
npm run pm2:monitor

# Check status
npm run pm2:status

# Stop the application
npm run pm2:stop

# Restart the application
npm run pm2:restart
```

Logs are stored in the `logs` directory:
- `logs/router-reset.log`: Standard output logs
- `logs/router-reset-error.log`: Error logs

Log features:
- Indian timezone (Asia/Kolkata)
- Timestamp prefix on each log
- Automatic log rotation (max 10MB per file)
- JSON format for structured logging
- Maximum 10 log files kept

### Manual Usage

#### Test Mode
To test the script immediately:
```bash
node router-reset.js --test
```

#### Scheduled Mode
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
- Store detailed logs with timestamps

## Security Note

Please ensure to:
- Never commit your `.env` file to version control
- Keep your router password secure
- Don't share the configured script with others
- Use environment variables for all sensitive information 