#!/bin/sh

# Run the database population script
node populate_db.js

# Start the main application
node src/app.js
