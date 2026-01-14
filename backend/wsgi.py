"""
WSGI entry point for production deployment
This file is used by gunicorn to serve the Flask application
"""
import os
import sys

try:
    from app import create_app
    
    # Create the Flask application instance
    # Use 'production' config for deployed environments
    # If FLASK_ENV is not set or is 'production', use production config
    config_name = os.getenv('FLASK_ENV', 'production')
    if config_name == 'production':
        # Verify required environment variables are set
        required_vars = ['DATABASE_URL', 'JWT_SECRET_KEY']
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        if missing_vars:
            print(f"ERROR: Missing required environment variables: {', '.join(missing_vars)}", file=sys.stderr)
            sys.exit(1)
    
    app = create_app(config_name=config_name)
    
except Exception as e:
    print(f"ERROR: Failed to create Flask application: {str(e)}", file=sys.stderr)
    import traceback
    traceback.print_exc(file=sys.stderr)
    sys.exit(1)

if __name__ == "__main__":
    app.run()
