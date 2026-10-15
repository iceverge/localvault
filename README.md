# LocalVault

A local personal account vault built as a Laravel 13 + React 19 / TypeScript monolith. Laravel serves the dashboard and same-origin JSON endpoints; SQLite stores accounts. There is no login screen.

## Installation

Requirements: PHP 8.3+, Composer, Node.js 22.12+ (or a compatible newer release), and PHP's SQLite extension.

```sh
git clone https://github.com/iceverge/localvault.git
cd localvault
composer run setup
php artisan serve --host=127.0.0.1 --port=8000
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000). Setup creates your local environment, generates an encryption key only when missing, creates the SQLite database, runs migrations, and builds the frontend.

If port 8000 is occupied, use `php artisan serve --host=127.0.0.1 --port=8005` and open [http://127.0.0.1:8005](http://127.0.0.1:8005).

For frontend development, run `npm run dev` alongside the Laravel server. Rebuild with `npm run build` when finished.

## Features

- Create, edit, and permanently delete accounts with site name, URL, username, email, password, category, and notes.
- Generate passwords when creating or editing; standalone generator supports configurable length and character groups.
- Search, category filters, favorites, sorting, and list/grid views.
- Reveal or copy saved passwords. Revealed values hide automatically after 15 seconds or when switching browser tabs.
- Responsive corporate dashboard with bundled Lucide icons and a local SVG favicon. No external fonts, images, favicon requests, or analytics.

## Optional password prefix

Set a personal prefix in your local `.env`:

```dotenv
VAULT_PASSWORD_PREFIX=your-prefix-
```

Leave this value blank or omit it to generate passwords without a prefix. The selected total length includes the prefix, with at least eight random characters retained. After editing `.env`, run `php artisan config:clear` and refresh the page; no frontend rebuild is required. Existing saved passwords are unchanged.

Commit `.env.example` with an empty value; keep `.env`, application keys, databases, backups, and credential exports private.

## Storage and access

Passwords use Laravel's encrypted model cast (authenticated AES-256-CBC encryption). Account list responses exclude passwords; revealing a password requires a CSRF-protected POST. Other account fields are stored as ordinary database fields. Responses disable caching.

The application accepts loopback clients and localhost hosts only. Keep the server bound to `127.0.0.1`. Anyone with access to this computer/browser can open the vault without a password. This application is designed for local use, not public hosting. Encryption does not protect against someone who has both the database and application key.

## Backup

Stop the server, then back up `database/database.sqlite` and `.env` together to a private, protected location. The `APP_KEY` in `.env` is required to decrypt passwords. Never run `key:generate` against an existing vault. To restore, install dependencies, restore both files, run `php artisan migrate`, build assets, and start the server. Database files and `.env` are ignored by Git.

## Checks

```sh
php artisan test
npm run build
npm run test:e2e
```

Browser tests use installed Google Chrome and a separate SQLite database at `/tmp/localvault-e2e.sqlite` on port 8001. They exercise account creation, persistence, password regeneration, favorites, search, deletion, generator controls, and mobile navigation.

## License

[MIT](LICENSE) — free to use, modify, and distribute.
