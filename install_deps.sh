export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
cd ~/home4stay
rm -rf pnpm-lock.yaml pnpm-workspace.yaml package-lock.json node_modules apps/main-site/node_modules apps/property-site/node_modules
npm install
