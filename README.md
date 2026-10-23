# Workfit

Personal-first, bilingual (TH/EN, Thai first) work-personality app for Thais and for foreigners working with Thais. Results are for development and conversation only: never automatic hiring, ranking or rejection.

## The Workfit standard

Everything comes from one 7-letter code:

```
I N B C  -  H M W
letters 1–2  → สาย (4 colour groups): IN สายคิดลึก · EN สายครีเอต · ES สายลุย · IS สายเสาหลัก
letters 1–4  → the character (16, each with a chaptered page incl. life outside work)
letters 5–7  → how you work with people, Thai-style (voice D/H · frame R/M · bond W/O)
```

| Letter | Axis | Poles | Built from |
| --- | --- | --- | --- |
| 1 | Energy | I / E | 75% extraversion + 25% sanuk; 40–60 = ambivert (faded letter), same rule as the energy meter |
| 2 | Ideas | S / N | openness |
| 3 | Drive | B / L | lead vs. support |
| 4 | Pace | C / Q | pace |
| 5 | Voice | D / H | kreng jai + face |
| 6 | Frame | M / R | structure + reversed mai pen rai |
| 7 | Bond | O / W | bunkhun + sanuk + collaboration |

All 128 codes are browsable in the code book (`/codes`); `/code` explains every letter.

## Test levels

| Level | Items | Gives |
| --- | --- | --- |
| Quick (~5 min) | 20 | code + character |
| Standard (~15 min) | 84 | stable code, 18 dimensions, situations |
| Professional (~30 min) | 132 | + the WorkFit spec's 48 role-interest items (12 roles shown as "work you want more of") |

Answers carry over between levels. Role items use a 6-point / 4-point scale with no neutral middle (`workfit-role-v2`).

## Run

```bash
npm install
npm run dev      # http://localhost:5220 (also on the LAN)
npm test         # Vitest: domain + spec golden cases
npm run build
```

## Structure

| Path | What |
| --- | --- |
| `src/domain/code.ts` | The 7 axes, `workfitCode()`, code book (`CODE_BOOK`), decoder |
| `src/domain/characters.ts` | 4 groups, 16 characters (content, careers, life areas, looks) |
| `src/domain/roles.ts` | WorkFit master spec engine: 48 items, half-up scoring, dominant / mixed / no_dominant, job discovery, interest alignment, context distance, growth roles |
| `src/domain/levels.ts` | Quick / Standard / Professional item sets |
| `src/domain/scoring.ts`, `items.ts` | 18-dimension style test (Likert, forced choice, scenarios) |
| `src/domain/sourcing.ts` | Job builder (duty weights summing to 100%, context ranges), filters, compare (2–3), interview guide; no overall score or ranking |
| `src/domain/team.ts`, `cluster.ts` | Team map (aggregates hidden under 5 people), Persona Lab |
| `src/domain/peer.ts`, `culture.ts` | Peer view (360) and Culture Bridge |
| `src/store/assessment.ts` | Persisted answers, level, context, growth roles, skills, working agreements |
| `src/components/character/` | `WorkPerson` art (16 varied people with props), `CodeCharacter`, role-interest icons |
| `src/pages/` | Landing, Test, Me (tabs), Characters (`/personas/:key`), Code guide, Code book, Deep dive, Peers, Team, Lab, Sourcing |

## Notes

- Browser-only PoC (localStorage); no backend yet. Sample people and the 600-person comparison population are synthetic and labelled as such.
- Product rules from the WorkFit master spec apply: no MBTI equivalence, no hiring score, unknown ≠ 0 or 50, interest ≠ ability, skills never change personality scores.
- Character and chapter text, item wording and thresholds are experimental and need expert and pilot review before real use.
- The app is brand-neutral: keep company names out of UI text.
- UI follows the personal UI.md standard: Tooltip component instead of `title`, `data-theme` dark mode, one Button, bottom bar below `lg`, 44px touch targets.
