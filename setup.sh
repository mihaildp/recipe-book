#!/bin/bash

echo "🚀 Recipe Book App Setup Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    echo "Download from: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js is installed: $(node --version)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm is installed: $(npm --version)${NC}"
echo ""

# Install backend dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd backend
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating backend .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Backend .env file created. Please edit it with your credentials.${NC}"
else
    echo -e "${GREEN}✅ Backend .env file already exists.${NC}"
fi

cd ..

# Install frontend dependencies
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
cd frontend
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating frontend .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Frontend .env file created. Please edit it with your credentials.${NC}"
else
    echo -e "${GREEN}✅ Frontend .env file already exists.${NC}"
fi

cd ..

echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your MongoDB URI and Google Client ID"
echo "2. Edit frontend/.env with your Google Client ID"
echo "3. Run 'npm run dev' in the backend directory"
echo "4. Run 'npm start' in the frontend directory"
echo ""
echo "For detailed instructions, see README.md"
