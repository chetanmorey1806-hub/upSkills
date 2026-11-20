# UpSkillr API (server)

Backend for the UpSkillr website: student accounts, admin uploads (recorded videos, photos, PDFs, files, video links) and the class chat (text, photos, PDFs, videos, any file and whole folders, live with Socket.IO).

Stack: Node 18+, Express 5, MySQL 8, Multer (uploads), Socket.IO (live chat), bcrypt + JWT (login).

## Setup

```bash
cd server
cp .env.example .env      # then edit .env
npm install
npm start                 # -> UpSkillr API on http://localhost:5050
```

In `.env` set at least:

| Key | What |
|---|---|
| `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` | MySQL login. The database and tables are created on first start. |
| `JWT_SECRET` | A long random string (min 16 characters). Changing it signs everybody out. |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | The admin account created on first start. |
| `CORS_ORIGIN` | The website address(es), comma separated, e.g. `https://upskillr.example.com`. |
| `UPLOAD_DIR` | Folder for uploaded files (keep it outside the website folder and back it up). |
| `ADMIN_MAX_MB`, `CHAT_MAX_MB` | Upload size limits (default 2048 MB for admin, 50 MB per chat file). |

## Connect the website

Build the website with the API address:

```bash
# in the project root (next to the website's package.json)
echo "VITE_API_URL=http://localhost:5050" > .env.local
npm run build
```

With `VITE_API_URL` set, Register / Login use this server, and **Chat**, **Study Material** and **Admin → Upload videos, photos & PDFs** work for every student on every device.

## Behind nginx

Proxy `/api/` and `/socket.io/` to the Node process, and allow big uploads:

```nginx
client_max_body_size 2100m;
location /api/       { proxy_pass http://127.0.0.1:5050; }
location /socket.io/ { proxy_pass http://127.0.0.1:5050; proxy_http_version 1.1;
                       proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; }
```

Run it permanently with `pm2 start src/index.js --name upskillr-api` (or a systemd service).

## Safety built in

- Passwords stored as bcrypt hashes; login rate-limited (30 tries / 15 min).
- Only the admin can upload or delete study material; students can delete only their own chat messages (the admin can delete any).
- Program files (`.exe`, `.bat`, `.sh`, `.apk`, …) cannot be shared.
- Files are stored under random names; anything that is not a photo / video / PDF / plain text is always downloaded, never opened in the browser.
- Every file needs a signed-in user.
