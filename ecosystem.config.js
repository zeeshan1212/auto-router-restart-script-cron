module.exports = {
  apps: [{
    name: 'router-reset',
    script: 'router-reset.js',
    watch: false,
    autorestart: true,
    max_restarts: 5,
    min_uptime: '60s',

    // Time configuration
    time: true, // Enable time prefix in logs
    timezone: 'Asia/Kolkata', // Indian timezone

    // Environment variables
    env: {
      NODE_ENV: 'production',
      TZ: 'Asia/Kolkata', // Set timezone for the application
    },

    // Logging configuration
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    out_file: 'logs/router-reset.log',
    error_file: 'logs/router-reset-error.log',
    merge_logs: true,
    log_type: 'json',

    // Advanced logging options
    log_options: {
      flags: 'a',
      mode: '0644',
    },

    // Combine output and error logs
    combine_logs: true,

    // Rotate logs
    max_size: '10M',
    rotate_logs: true,
    max_log_files: 10,
  }]
}; 