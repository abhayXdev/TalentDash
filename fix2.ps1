$ErrorActionPreference = "Continue"

Rename-Item -LiteralPath 'src\app\salaries\page.tsx' -NewName 'page.bak.tsx' -ErrorAction SilentlyContinue
Rename-Item -LiteralPath 'src\app\companies\[slug]\page.tsx' -NewName 'page.bak.tsx' -ErrorAction SilentlyContinue
Rename-Item -LiteralPath 'src\app\api\salaries\route.ts' -NewName 'route.bak.ts' -ErrorAction SilentlyContinue
Rename-Item -LiteralPath 'src\app\api\companies\[slug]\route.ts' -NewName 'route.bak.ts' -ErrorAction SilentlyContinue
Rename-Item -LiteralPath 'src\app\salaries\loading.tsx' -NewName 'loading.bak.tsx' -ErrorAction SilentlyContinue
Rename-Item -LiteralPath 'src\app\salaries\error.tsx' -NewName 'error.bak.tsx' -ErrorAction SilentlyContinue

Rename-Item -LiteralPath 'src\app\salaries\page.bak.tsx' -NewName 'page.txt' -ErrorAction SilentlyContinue
Rename-Item -LiteralPath 'src\app\companies\[slug]\page.bak.tsx' -NewName 'page.txt' -ErrorAction SilentlyContinue
Rename-Item -LiteralPath 'src\app\api\salaries\route.bak.ts' -NewName 'route.txt' -ErrorAction SilentlyContinue
Rename-Item -LiteralPath 'src\app\api\companies\[slug]\route.bak.ts' -NewName 'route.txt' -ErrorAction SilentlyContinue
Rename-Item -LiteralPath 'src\app\salaries\loading.bak.tsx' -NewName 'loading.txt' -ErrorAction SilentlyContinue
Rename-Item -LiteralPath 'src\app\salaries\error.bak.tsx' -NewName 'error.txt' -ErrorAction SilentlyContinue

Rename-Item -LiteralPath 'src\app\salaries\page.tsx' -NewName 'page.txt' -ErrorAction SilentlyContinue
Rename-Item -LiteralPath 'src\app\companies\[slug]\page.tsx' -NewName 'page.txt' -ErrorAction SilentlyContinue
Rename-Item -LiteralPath 'src\app\api\salaries\route.ts' -NewName 'route.txt' -ErrorAction SilentlyContinue
Rename-Item -LiteralPath 'src\app\api\companies\[slug]\route.ts' -NewName 'route.txt' -ErrorAction SilentlyContinue
Rename-Item -LiteralPath 'src\app\salaries\loading.tsx' -NewName 'loading.txt' -ErrorAction SilentlyContinue
Rename-Item -LiteralPath 'src\app\salaries\error.tsx' -NewName 'error.txt' -ErrorAction SilentlyContinue

npx.cmd prisma db seed
npm.cmd run build
