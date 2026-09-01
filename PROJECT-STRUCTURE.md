# Amplizo - Project Structure

## 📁 Complete Project Structure

```
amplizo/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions CI/CD
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── seed.ts            # Seed data
│   │   ├── dev.db             # SQLite dev database
│   │   └── prod.db            # SQLite prod database
│   ├── src/
│   │   ├── admin/             # Admin module
│   │   ├── auth/              # Authentication module
│   │   ├── chat/              # Chat module
│   │   ├── common/            # Shared services
│   │   ├── prisma/            # Database service
│   │   ├── upload/            # File upload module
│   │   ├── visitor/           # Visitor tracking
│   │   ├── websocket/         # WebSocket gateway
│   │   ├── app.module.ts      # Main app module
│   │   └── main.ts            # Entry point
│   ├── uploads/               # Uploaded files
│   ├── .env                   # Environment variables (gitignored)
│   ├── .env.example           # Environment template
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   │   ├── admin/         # Admin pages
│   │   │   ├── ai-brain/      # AI Brain page
│   │   │   ├── ai-decisions/  # AI Decisions page
│   │   │   ├── ai-employees/  # AI Employees page
│   │   │   ├── ai-predictions/# AI Predictions page
│   │   │   ├── auth/          # Auth callback
│   │   │   ├── billing/       # Billing page
│   │   │   ├── blog/          # Blog pages
│   │   │   ├── branches/      # Branches page
│   │   │   ├── chats/         # Live chats
│   │   │   ├── client-dashboard/ # Client dashboard
│   │   │   ├── crm/           # CRM page
│   │   │   ├── dashboard/     # Admin dashboard
│   │   │   ├── employees/     # Employees page
│   │   │   ├── feedback/      # Feedback page
│   │   │   ├── forgot-password/
│   │   │   ├── help/          # Help page
│   │   │   ├── integrations/  # Integrations page
│   │   │   ├── inventory/     # Inventory page
│   │   │   ├── leads/         # Leads page
│   │   │   ├── login/         # Login page
│   │   │   ├── loyalty/       # Loyalty page
│   │   │   ├── plans/         # Plans page
│   │   │   ├── reviews/       # Reviews page
│   │   │   ├── sales-dashboard/
│   │   │   ├── security/      # Security page
│   │   │   ├── signup/        # Signup page
│   │   │   ├── timeline/      # Timeline page
│   │   │   └── whatsapp/      # WhatsApp page
│   │   ├── components/        # Reusable components
│   │   │   ├── chat/          # Chat components
│   │   │   ├── common/        # Common components
│   │   │   ├── layout/        # Layout components
│   │   │   └── ui/            # UI components
│   │   ├── lib/               # Utilities & API
│   │   ├── store/             # Zustand stores
│   │   └── test/              # Tests
│   ├── .next/                 # Build output (gitignored)
│   ├── .env.example           # Environment template
│   ├── .env.local             # Local env (gitignored)
│   ├── next.config.mjs
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── .gitignore                 # Git ignore rules
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # CI/CD pipeline
├── CONTRIBUTING.md            # Contribution guidelines
├── docker-compose.yml         # Docker orchestration
├── LICENSE                    # MIT License
├── README.md                  # Project documentation
├── SECURITY.md                # Security policy
└── upload-to-github.sh        # Upload script
```

## 🚀 GitHub Upload Instructions

### Step 1: Install Git
Download and install Git from: https://git-scm.com/download/win

### Step 2: Open Terminal in Project Folder
```bash
cd C:\Users\raman\retainx
```

### Step 3: Initialize Git
```bash
git init
git config user.name "Your Name"
git config user.email "your-email@example.com"
```

### Step 4: Add Files
```bash
git add .
git status  # Check what's being added
```

### Step 5: Commit
```bash
git commit -m "Initial commit: Amplizo AI-Powered Live Chat Platform"
```

### Step 6: Create GitHub Repository
1. Go to https://github.com/new
2. Name: `amplizo`
3. Keep it public or private
4. Do NOT add README (we already have one)

### Step 7: Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/amplizo.git
git branch -M main
git push -u origin main
```

### Step 8: Enter Credentials
- Username: Your GitHub username
- Password: Your Personal Access Token (not your password!)

## 📋 Files Added for Professional Setup

| File | Purpose |
|------|---------|
| `.gitignore` | Ignores node_modules, .env, build files |
| `README.md` | Professional project documentation |
| `CONTRIBUTING.md` | Contribution guidelines |
| `SECURITY.md` | Security policy |
| `LICENSE` | MIT License |
| `.github/workflows/ci-cd.yml` | CI/CD pipeline |
| `backend/.env.example` | Backend env template |
| `frontend/.env.example` | Frontend env template |
| `upload-to-github.sh` | Upload helper script |

## ⚠️ Important Notes

1. **Never commit `.env` files** - They contain secrets
2. **Change default credentials** before production
3. **Use strong JWT secret** (64+ characters)
4. **Rotate GitHub tokens** regularly
