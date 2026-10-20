# Contributing to MineOS

Thank you for your interest in contributing to **MineOS**! We welcome contributions from developers, mining safety engineers, hardware enthusiasts, and open-source practitioners.

---

## Code of Conduct

Please treat all contributors, maintainers, and community members with respect and courtesy. Harassment or discriminatory behavior will not be tolerated.

---

## Development Workflow

### 1. Fork and Clone
```bash
git clone https://github.com/NitikasriJeyanAchary0109/mineos.git
cd mineos
```

### 2. Branching Strategy
Create a feature or bugfix branch from `main`:
- `feat/feature-name` for new capabilities
- `fix/bug-fix-name` for bug resolutions
- `docs/documentation-update` for documentation improvements

### 3. Local Setup
```bash
# Frontend setup
npm install
npm run dev

# Backend setup (in a separate terminal)
cd backend
npm install
npm run dev
```

### 4. Code Standards
- **TypeScript**: Ensure strict typing without unnecessary `any` overrides.
- **Tailwind CSS**: Maintain design system consistency with established palette tokens and glassmorphism styling.
- **Validation**: Verify that TypeScript compiles cleanly before opening a Pull Request:
  ```bash
  npm run build
  cd backend && npm run build
  ```

---

## Submitting Pull Requests

1. Commit your changes with concise, descriptive commit messages adhering to Conventional Commits:
   - `feat(...)`: New features or UI screens
   - `fix(...)`: Bug fixes or telemetry parsing corrections
   - `docs(...)`: Documentation or diagram updates
2. Push your branch to your fork and submit a Pull Request against `main`.
3. Provide a clear description of the problem solved, testing steps conducted, and before/after screenshots for any UI changes.

---

## Questions or Assistance

If you have questions about system architecture or contribution priorities, please check [docs/SUPPORT.md](SUPPORT.md) or open an issue on GitHub.
