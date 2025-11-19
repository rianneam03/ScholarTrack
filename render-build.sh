#!/usr/bin/env bash
set -o errexit

echo "Installing backend dependencies..."
pip install -r requirements.txt

echo "Building frontend..."
cd backend/frontend
npm install
npm run build

echo "Frontend build completed!"
