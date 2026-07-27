#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 24

cd ~/home4stay
echo "Cleaning up previous bad installations..."
rm -rf node_modules apps/*/node_modules packages/*/node_modules

echo "Installing with scripts enabled..."
npm config set ignore-scripts false
npm install

echo "Generating Prisma client..."
cd apps/main-site
npx prisma generate
cd ../..

echo "Building project..."
npm run build
