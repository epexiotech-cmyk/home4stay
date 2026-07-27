# Home4Stay - Local Development Setup Guide

**IMPORTANT:** Home4Stay is designed to be developed exclusively inside the native WSL (Windows Subsystem for Linux) filesystem. Developing directly from Windows (e.g., `/mnt/c` or `/mnt/d`) is **unsupported** and will cause POSIX file-locking crashes (Turbopack `os error 13`) and severe performance degradation (up to 10x slower).

---

## 1. Required Software
Before you begin, ensure you have the following installed on Windows:
- **Windows Subsystem for Linux (WSL 2)** with an Ubuntu distribution.
- **Visual Studio Code** with the **WSL Extension** installed.

## 2. WSL Installation
If you haven't installed WSL yet, open PowerShell as Administrator and run:
```powershell
wsl --install -d Ubuntu-24.04
```
Restart your computer if prompted.

## 3. PostgreSQL Installation (Inside WSL)
Open your WSL Ubuntu terminal and install PostgreSQL natively:
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```
Start the service and configure the database:
```bash
sudo service postgresql start
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
sudo -u postgres createdb home4stay
```

## 4. Redis Installation (Inside WSL)
Install Redis natively in WSL:
```bash
sudo apt install -y redis-server
sudo service redis-server start
```
*Note: Ensure Redis is running on port 6379 (`redis-cli ping` should return `PONG`).*

## 5. Node.js Installation (Inside WSL)
Use Node Version Manager (NVM) to install Node.js inside WSL. Do **not** use the Windows Node.js installation.
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 24
nvm use 24
nvm alias default 24
```

## 6. Clone Repository
Clone the repository directly into your WSL home directory (`~`):
```bash
cd ~
git clone <repository-url> home4stay
```

## 7. Move Repository (If existing on Windows)
If your repository currently resides on a Windows drive (e.g., `D:\AAPP\home4stay`), move it to the native WSL filesystem:
```bash
rsync -av --exclude='node_modules' --exclude='.next' --exclude='.git' /mnt/d/AAPP/home4stay/ ~/home4stay/
```

## 8. Environment Variables
Navigate to the project directory and set up your environment variables:
```bash
cd ~/home4stay
cp .env.example .env
cp .env.local.example .env.local
```
Ensure your database and Redis connections use standard localhost endpoints, as both services are now running natively in WSL alongside the application:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/home4stay?schema=public"
REDIS_URL="redis://127.0.0.1:6379"
```

## 9. Dependencies & Prisma Setup
Install project dependencies. The Prisma client will automatically generate via a postinstall hook:
```bash
npm config set ignore-scripts false
npm install
```

## 10. Start Services
Before starting development, always ensure your infrastructure services are running in WSL:
```bash
sudo service postgresql start
sudo service redis-server start
```

## 11. Start Development
Always launch Visual Studio Code from inside the WSL terminal so that it connects using the WSL extension:
```bash
cd ~/home4stay
code .
```
Inside the VS Code integrated terminal (which is now a WSL bash shell), start the development servers:
```bash
npm run dev
```

## 12. Common Troubleshooting
- **Build Crash (Redis ECONNREFUSED)**: This occurs when running `next build` from Windows against a WSL Redis instance due to Windows-to-WSL proxy concurrency limits. Always run the build directly inside WSL.
- **Turbopack `os error 13`**: This means you are running the project from `/mnt/c` or `/mnt/d`. Move the project to `~/home4stay` in the native Linux filesystem to resolve POSIX file-locking issues.
- **Prisma Client not found**: Ensure `npm install` finished successfully so the postinstall hook generates the client. Ensure you do not have conflicting `.env` files in the `prisma/` folder.

## 13. DO NOT Develop from /mnt/c or /mnt/d
Never open the project from your `C:\` or `D:\` drive in WSL. Always use `~/` or `/home/<username>/`. The cross-OS filesystem translation layer (`9P` protocol) is drastically slower and lacks full POSIX compliance, which will break Next.js tooling.

## 14. Why WSL Native is Required
Home4Stay utilizes Next.js with Turbopack (written in Rust) and heavily concurrent build architectures. Turbopack relies on POSIX `flock` mechanisms which Windows drives mounted in WSL do not support. Additionally, Next.js static page generation creates high-concurrency connection spikes to Redis and PostgreSQL, which the Windows `localhost` proxy cannot reliably handle, leading to dropped connections. Running everything natively inside WSL bypasses the proxy and ensures 100% Linux system compatibility.
