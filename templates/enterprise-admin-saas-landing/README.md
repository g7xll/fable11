# Sentra

A clean, authoritative landing page for a fictional enterprise admin / security SaaS, **Sentra**. The style is "corporate professional" built on a strict 40px grid: the Satoshi typeface (weights 400–900), a slate-and-blue palette (slate-950 `#020617`, primary blue `#2563EB`), 12px card / 8px button radii, and subtle `#E2E8F0` borders. Green / amber / red are reserved strictly for status indicators.

The narrative runs top-down: a fixed glass nav (`rgba(255,255,255,0.7)` + 12px blur), a centered hero over a faint 40px grid with a pulsing status badge, a simulated browser dashboard preview (sidebar, stats row, and a sticky-header audit log table with status badges), a 3-column module grid, a dark stats section with concentric rings and KPI count-ups, a split security section with clickable glass-morphism policy toggles and an overlapping "threat blocked" alert, an FAQ accordion, a CTA band, and a 6-column footer.

Vanilla JS drives the KPI count-up (IntersectionObserver, ease-out-quartic over 2s), the policy toggles, the FAQ, and 0.8s fade-in-up reveals.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
