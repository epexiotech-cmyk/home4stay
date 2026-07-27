export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm install -g pnpm
cd ~/home4stay
rm -rf node_modules apps/main-site/node_modules apps/property-site/node_modules
pnpm install
