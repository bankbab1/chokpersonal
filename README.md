# Workfit

Personal-first, bilingual (TH/EN, Thai first) work-personality app for Thais and for foreigners working with Thais.

Thai workplace persona, job-fit and **talent sourcing** web app (PoC). Recruiters build a role profile (job-area template, clone top performers, or fill team blind spots), invite candidates by link, and get a ranked shortlist of external applicants plus opted-in internal staff, with job/team/manager fit, talk-vs-do flags and a per-candidate interview guide. Candidates and staff take a ~20-minute assessment and get one of 24 Thai personas (6 animal families × lead/support × fast/careful), modifier tags, 18 dimension scores, job-line, environment and manager fit, and Workfit insights: talk vs. delivery, silence risk, power imbalance and clique risk.

Design doc: https://claude.ai/artifact/5S7dpErHeBHpwTyeRW2gvg

## Run

```bash
npm install
npm run dev      # http://localhost:5220
npm test         # domain unit tests (Vitest)
npm run build
```

## Structure

| Path | What |
| --- | --- |
| `src/domain/` | Pure logic, no React: item bank, scoring, persona assignment, fit engine, insights, team analysis, seeded demo staff |
| `src/store/assessment.ts` | Zustand store persisted to `localStorage` (`workfit-assessment-v1`) |
| `src/components/character/` | Characters drawn in SVG code (swap `ANIMALS` for final art) and the persona avatar (clarity ring and badges) |
| `src/domain/sourcing.ts` | Role profiles, benchmark cloning, team-gap targets, candidate scoring, interview guide |
| `src/domain/styles.ts` | Familiar frames rebuilt as spectrums: introvert/ambivert/extrovert, 4 work styles with blend, 4-letter code + A/T, temperament group, top 5 strengths, combined Workfit ID |
| `src/domain/model.ts`, `cluster.ts` | Persona model as data (family centroids, nearest-centroid assignment); Persona Lab clustering (k-means++, k chosen by silhouette, min group 5%) |
| `src/lib/i18n.ts` | Language store and `useT()`; all content is `{ th, en }` pairs next to its data |
| `src/domain/peer.ts` | Peer view (360): 16 observer items, invite tokens, `WF1.` response codes, self-vs-others summary (blind spots, hidden strengths, peer-rated delivery) |
| `src/domain/culture.ts` | Culture Bridge tips by the person's Thai-dimension scores, for Thais in international teams or foreigners in Thai teams |
| `src/pages/` | Landing, Test, Me (result), Personas, Peer view (/peers), Rater page (/rate/:token), Org hub (/org), Persona Lab (/lab), Sourcing (home, role editor, shortlist), Team |

## Notes

- Everything runs in the browser for the PoC; there is no backend yet. HR and Team pages use 40 synthetic staff, labelled as sample data.
- Forced-choice scoring is a simple most/least point count. Replace it with a Thurstonian IRT model before comparing people across the company.
- "Delivery" in the talk-vs-do index is self-reported until the 360 form exists. The demo staff carry a simulated 360 value.
- UI follows the personal UI.md standard (room-booking-visualizer/docs/UI.md): Tooltip component instead of `title`, `data-theme` dark mode, one Button with explicit sizes, and a bottom bar below `lg`.

- The app is brand-neutral: keep company names out of UI text. Job areas are 18 broad categories common in Thai organisations, each with example titles.
- The 24 personas are a starter hypothesis. After the pilot, export a fitted model from /lab, confirm it with latent profile analysis, name the groups with staff, and replace `STARTER_MODEL`.
- Peer ratings travel back as a pasted response code because there is no backend yet; a real deployment should store them server-side.
- English item wording still needs back-translation and expert review before the pilot.
