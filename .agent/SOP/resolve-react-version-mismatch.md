# SOP: Resolve React Version Mismatch

## Problem
`package.json` declares React 19.2.0 but `package-lock.json` installs React 18.3.1, causing peer dependency warnings and potential runtime issues. Next.js 15.5.4 requires React 19.

## Symptoms
- npm warns: `ERESOLVE overriding peer dependency`
- `package.json` shows React 19.2.0
- `package-lock.json` shows React 18.3.1
- Hydration errors or unexpected behavior

## Quick Fix

```bash
# 1. Clean install
rm -rf node_modules package-lock.json
npm install react@19.2.0 react-dom@19.2.0 --save-exact
npm install

# 2. Verify
npm ls react react-dom
# Should show both at 19.2.0

# 3. Test
npm run dev
```

## Validation Checklist
- [ ] `npm ls react react-dom` shows no conflicts
- [ ] `npm install` runs without peer dependency warnings
- [ ] `npm run dev` starts successfully
- [ ] No hydration errors in browser console

## Troubleshooting

### Still Installing React 18?
A dependency requires React 18. Find it:
```bash
npm ls react
```

Fix options (in order):
1. Upgrade conflicting package: `npm install <package>@latest`
2. Remove if not critical: `npm uninstall <package>`
3. Last resort: `npm install --legacy-peer-deps` (⚠️ may cause issues)

### Package Manager Mismatch
Architecture mentions pnpm but using npm. Choose one:

**Switch to pnpm** (recommended):
```bash
rm -rf node_modules package-lock.json
npm install -g pnpm
pnpm install
```

**Or standardize on npm**: Update architecture docs to reflect npm usage.

### Duplicate Versions
```bash
npm ls react --all  # Check for duplicates
npm dedupe          # Remove duplicates
npm install
```

### Critical Vulnerability
```bash
npm audit           # View details
npm audit fix       # Attempt auto-fix
```

## Prevention
- Never manually edit lock files
- Commit lock files to version control
- Use exact versions: `"react": "19.2.0"` not `"^19.2.0"`
- Standardize on one package manager
- Use `npm ci` in CI/CD (enforces exact lock file)

## Notes
- 7000+ lines in `package-lock.json` is normal for Next.js projects
- React 19 required for Next.js 15.5.4
- pnpm creates smaller lock files (~1000-2000 lines)

## Related
- `.agent/PROJECT_ARCHITECTURE.md` - Tech stack
- Next.js 15 Upgrade Guide: https://nextjs.org/docs/app/building-your-application/upgrading