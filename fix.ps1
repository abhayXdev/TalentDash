$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path src\components\ui, src\components\features, src\types | Out-Null
npm.cmd install -D prettier

# Disable Day 2 files
Rename-Item -Path src\app\salaries\page.tsx -NewName page.tsx.bak -ErrorAction SilentlyContinue
Rename-Item -Path src\app\companies\[slug]\page.tsx -NewName page.tsx.bak -ErrorAction SilentlyContinue
Rename-Item -Path src\app\api\salaries\route.ts -NewName route.ts.bak -ErrorAction SilentlyContinue
Rename-Item -Path src\app\api\companies\[slug]\route.ts -NewName route.ts.bak -ErrorAction SilentlyContinue
Rename-Item -Path src\app\salaries\loading.tsx -NewName loading.tsx.bak -ErrorAction SilentlyContinue
Rename-Item -Path src\app\salaries\error.tsx -NewName error.tsx.bak -ErrorAction SilentlyContinue

# Prisma migrations
npx.cmd prisma migrate reset --force
npx.cmd prisma migrate dev --name init

# Build and lint
npm.cmd run build
npm.cmd run lint
