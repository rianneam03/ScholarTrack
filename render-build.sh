#!/usr/bin/env bash
# Render build script

# Install backend dependencies
pip install -r requirements.txt

# Build frontend (if needed)
cd backend/frontend
npm install
npm run build
