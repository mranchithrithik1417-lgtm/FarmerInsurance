# KisanClaim glass UI (what changed)

Only the skin changed. All components, API calls, DIGIPIN, ULPIN, satellite twin,
voice assistant, camera, AI agents, evidence graph, copilot and report logic are untouched.

- frontend/src/index.css  : glass theme (Tailwind v4 @theme palette remap, glass cards, inset inputs,
                            raised buttons, insurer blue theme via html[data-role="insurance"]).
- frontend/index.html     : Figtree, Bricolage Grotesque, DM Mono, Noto Sans Kannada fonts.
- frontend/src/components/Navbar.tsx : simplified, uncluttered top bar (same props and behaviour).
- frontend/src/App.tsx    : sets data-role on <html> for the green/blue theme; calmer toast.
- frontend/src/components/auth/AuthPage.tsx : leaf logo instead of emoji.

Run: start_both.bat  (backend :8000, frontend :8001)  or
  python -m uvicorn backend.main:app --port 8000   (from project root)
  cd frontend && npm install && npm run dev
