# Záber Films – Video Production Studio Website

A full-stack, white-label website for a commercial video production studio: portfolio showcase,
production services & gear, studio/crew page, an interactive budget estimator and a multi-step
project brief wizard that feeds a Slovak-language Django admin.

All code and documentation are in English; all user-facing copy and seeded content are in Slovak.

```
.
├── backend/    Django 6 + Django REST Framework API and admin
└── frontend/   Angular 22 SPA (standalone components, Signals, pure SCSS)
```

## Requirements

- Python 3.12+ (developed on 3.14)
- Node.js 20.19+ / 22+ and npm (developed on Node 22, Angular CLI 22)

## 1. Backend (`/backend`)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                 # optional – sensible dev defaults are built in
python manage.py migrate
python manage.py seed_data           # idempotent demo content (safe to re-run)
python manage.py createsuperuser     # for /admin
python manage.py runserver 8000
```

- API root: <http://localhost:8000/api/>
- Admin: <http://localhost:8000/admin/> (Slovak UI – portfolio, services, crew, categories, incoming briefs)
- Tests: `python manage.py test production`
- `python manage.py seed_data --reset` wipes the catalogue (films, services, crew, categories) before
  seeding; incoming briefs are never touched.

### API

| Method | Endpoint | Notes |
| ------ | -------- | ----- |
| GET | `/api/categories/` | Categories with `film_count` and `service_count` |
| GET | `/api/portfolio/` | Filters: `category` (slug), `featured`, `year`, `search` (title/client/sector/gear), `ordering` |
| GET | `/api/portfolio/<slug>/` | Full case study + `related_films` |
| GET | `/api/services/` | Filters: `category`, `featured`, `search`, `ordering` |
| GET | `/api/crew/` | Core team |
| POST | `/api/briefs/` | Create a production brief (validated, Slovak error messages, throttled to 20/hour per IP) |

### Configuration (`backend/.env`)

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `DJANGO_SECRET_KEY` | dev-only key | **Set in production** |
| `DJANGO_DEBUG` | `True` | `False` in production (enables secure cookies and the HTTPS proxy header) |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated |
| `DATABASE_URL` | SQLite `db.sqlite3` | e.g. `postgres://user:pass@host:5432/studio` (install `psycopg[binary]`) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:4200,…` | Frontend origin(s) |
| `CSRF_TRUSTED_ORIGINS` | – | Needed for the admin behind HTTPS |
| `BRIEF_THROTTLE_RATE` | `20/hour` | Rate limit for brief submissions |

## 2. Frontend (`/frontend`)

```bash
cd frontend
npm install
npm start                            # ng serve → http://localhost:4200
npm run build                        # production build → dist/frontend/browser
```

The dev build talks to `http://localhost:8000/api` (`src/environments/environment.ts`).
The production build uses the same-origin path `/api` (`environment.prod.ts`), so serve the SPA and
proxy `/api` + `/admin` to Django behind one domain – or change `apiUrl` there.

> If port 8000 is already used on your machine, run Django on another port
> (`runserver 8010`) and update `apiUrl` in `environment.ts` accordingly.

### Pages

| Route | Page |
| ----- | ---- |
| `/` | Cinematic hero with showreel lightbox, featured films, services, budget estimator, workflow, testimonials |
| `/portfolio` | Filterable gallery (`?kategoria=<slug>`, diacritics-insensitive search), instant playback |
| `/portfolio/:slug` | Case study: embedded player, tech spec bar, brief & solution, deliverables, “similar video” CTA |
| `/sluzby` | Production services + gear showcase |
| `/o-studiu` | Philosophy, crew, FAQ accordion |
| `/dopyt` | 3-step brief wizard, pre-fillable via `?type=&tier=&days=&addons=&inspiration=` |

## White-labelling for a new client

1. **Business details & copy** – edit `frontend/src/app/core/config/site.config.ts`
   (studio name, wordmark, tagline, hero copy & image, showreel URL, producer contact, address,
   IČO/DIČ/IČ DPH, drone certification note, social links, trust metrics, client names, testimonials, SEO).
2. **Colours & fonts** – edit the CSS custom properties in `frontend/src/styles.scss` (`:root`) and,
   if needed, the SCSS tokens in `src/styles/_variables.scss` plus the Google Fonts link in `src/index.html`.
3. **Pricing logic** – estimator base prices, day rates, add-ons and crew recommendations live in
   `frontend/src/app/core/production/production-options.ts`.
4. **Content** – portfolio films, services, crew and categories are managed in the Django admin
   (or adjust `backend/production/management/commands/seed_data.py`).
5. Replace `frontend/public/favicon.svg`.

## Notes

- Video embeds are restricted to YouTube (`/embed/`) and Vimeo (`player.vimeo.com/video/`) URLs –
  validated in the Django model and again in the frontend before being trusted by Angular's sanitizer.
  YouTube embeds are rewritten to the privacy-friendlier `youtube-nocookie.com` domain.
- Seed videos are Blender Foundation open movies and a Vimeo short used as royalty-free placeholders;
  images are from Unsplash. Replace them with the studio's own work before launch.
- The brief endpoint is write-only: submissions can be read only in the admin.
