# Substack Notes Manager

A web app to manage, schedule, and publish your Substack Notes.

## Features

- **View Notes**: See your recent Substack Notes with likes count
- **Create Notes**: Write and publish notes instantly
- **Schedule Notes**: Schedule notes to be published at a specific time
- **Simple Authentication**: Uses your Substack session cookie

## Setup

### Prerequisites

- Node.js 18+
- A Substack account

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Getting Your Substack Cookie

1. Log in to your Substack account at [substack.com](https://substack.com)
2. Open Browser DevTools (F12 or Right-click → Inspect)
3. Go to **Application** tab → **Cookies** → `substack.com`
4. Find the cookie named `connect.sid`
5. Copy the entire value (starts with `s%3A...`)

### Deployment on Railway

1. Push this repo to GitHub
2. Create a new project on [Railway](https://railway.app)
3. Connect your GitHub repo
4. Railway will auto-detect and deploy

**Important**: On Railway, the data is stored in the container filesystem. For production use, consider migrating to a database like PostgreSQL (Railway provides this as an add-on).

## Architecture

```
src/
├── app/
│   ├── api/           # API routes
│   │   ├── config/    # Authentication config
│   │   ├── notes/     # Notes CRUD
│   │   ├── scheduled/ # Scheduled notes
│   │   ├── scheduler/ # Scheduler control
│   │   └── profile/   # User profile
│   ├── dashboard/     # Main dashboard UI
│   └── settings/      # Settings page
├── lib/
│   ├── storage.ts     # JSON file storage
│   ├── substack.ts    # Substack API wrapper
│   ├── scheduler.ts   # Cron job scheduler
│   └── utils.ts       # Utilities
└── instrumentation.ts # Server startup hook
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/config` | GET | Get config status |
| `/api/config` | POST | Save credentials |
| `/api/config` | DELETE | Clear credentials |
| `/api/notes` | GET | Fetch notes |
| `/api/notes` | POST | Publish note |
| `/api/scheduled` | GET | Get scheduled notes |
| `/api/scheduled` | POST | Schedule a note |
| `/api/scheduled` | DELETE | Delete scheduled note |
| `/api/scheduled` | PATCH | Update scheduled note |
| `/api/profile` | GET | Get user profile |
| `/api/scheduler` | GET | Get scheduler status |
| `/api/scheduler` | POST | Control scheduler (start/stop/trigger) |

## Security Notes

- The `connect.sid` cookie provides full access to your Substack account
- The cookie is stored locally on the server in a JSON file
- For production, consider encrypting stored credentials
- Never share your `connect.sid` cookie

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Scheduling**: node-cron
- **Substack API**: substack-api library

## License

MIT
