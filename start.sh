#!/bin/bash

echo "Starting Restaurant Finder MEAN App..."

# Start the backend server
echo "Starting backend server..."
cd server
npm install
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start the frontend
echo "Starting frontend..."
cd ../client
npm install
npm start & npm build
FRONTEND_PID=$!

echo "Both servers are starting..."
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:4200"
echo ""
echo "To stop both servers, press Ctrl+C"

# Wait for user to stop
wait $BACKEND_PID $FRONTEND_PID
