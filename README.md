# CipherSQLStudio

A browser-based SQL learning platform where students can practice SQL queries in a secure sandboxed environment with AI-powered hints.

## Features

-  **Pre-configured SQL Assignments** - Curated exercises with varying difficulty levels
-  **Secure Sandbox Execution** - PostgreSQL queries run in a read-only environment with timeouts
-  **AI-Powered Hints** - Get conceptual guidance without spoiling the solution
-  **Monaco SQL Editor** - Professional code editor with syntax highlighting
-  **Instant Results** - View query results in a clean, responsive table

## Tech Stack

**Frontend:**
- React 18 with Vite
- Monaco Editor for SQL editing
- SCSS for styling
- React Router for navigation

**Backend:**
- Node.js + Express
- PostgreSQL (sandbox database)
- MongoDB (assignment metadata)
- OpenAI API (hint generation)

**DevOps:**
- Docker Compose for local development
- Health checks and auto-seeding

## Getting Started

### Quick Start (Local)

1.  **Install dependencies**
    ```bash
    npm install
    ```

2.  **Configure Environment**
    - Copy `.env.example` to `backend/.env`
    - Add your `OPENAI_API_KEY` to `backend/.env`
    - Ensure PostgreSQL is running locally

3.  **Setup Database**
    - Create database: `CipherSQLStdio_DB`
    - Run seed script: `node backend/seed/execute_seed.js` (requires admin password)
    - Seed MongoDB: `cd backend && npm run seed`

4.  **Run Application**
    ```bash
    npm run dev
    ```
    This starts both backend (port 4000) and frontend (port 5173).

### Quick Start (Docker)

1.  **Configure Environment**
    - Copy `.env.example` to `backend/.env`
    - Add your `OPENAI_API_KEY`

2.  **Start Services**
    ```bash
    docker-compose up --build
    ```
    - PostgreSQL will be available on port **5435** (to avoid conflicts)
    - App available at [http://localhost:5173](http://localhost:5173)

## Usage

1. **Choose an Assignment** - Select from the list of available SQL challenges
2. **Read the Question** - Understand what the query should return
3. **Review Sample Data** - Examine the table schemas and sample rows
4. **Write SQL** - Use the Monaco editor to write your query
5. **Execute** - Click "Run Query" to see results
6. **Get Hints** - If stuck, request AI hints at different levels (low/medium/high)

## Security Features

The platform implements multiple security layers:

- **Read-Only Database User** - Queries use `sandbox_reader` with SELECT-only privileges
- **Query Validation** - Blacklist dangerous keywords (DROP, DELETE, etc.)
- **Multi-Statement Prevention** - Only one query allowed at a time
- **Timeouts** - 2-second statement and lock timeouts
- **Row Limits** - Automatic LIMIT enforcement (max 500 rows)
- **Error Sanitization** - No stack traces exposed to users

## Project Structure

```
ciphersqlstudio/
├── backend/
│   ├── config/           # Database connections
│   ├── controllers/      # API controllers
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── services/         # Business logic (validation, LLM, DB)
│   ├── seed/             # Database seed scripts
│   └── server.js         # Express entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Pages (AssignmentList, AssignmentAttempt)
│   │   └── styles/       # SCSS design system
│   └── vite.config.js
└── docker-compose.yml    # Multi-service orchestration
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assignments` | List all assignments |
| GET | `/api/assignments/:id` | Get assignment details |
| POST | `/api/assignments/:id/execute` | Execute SQL query |
| POST | `/api/assignments/:id/hint` | Get AI hint |

## Development

### Running Without Docker

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Note:** You'll need to run PostgreSQL and MongoDB locally and update connection strings in `.env`.

### Seed Database Manually

```bash
# PostgreSQL
psql -U postgres -d CipherSQLStdio_DB -f backend/seed/seed_postgres.sql

# MongoDB
cd backend
npm run seed
```

## LLM Hint System

The hint system is designed to never provide full solutions:

- **Low Level**: High-level conceptual guidance
- **Medium Level**: More specific hints about SQL clauses to use
- **High Level**: Detailed pseudocode, but no runnable SQL

The system prompt ensures the LLM always returns hints in JSON format:
```json
{
  "hint": "Try using a JOIN to combine these tables...",
  "nextSteps": ["Identify the joining column", "Use GROUP BY to aggregate"],
  "explainWhy": "This teaches you how to combine data from multiple tables"
}
```

## Troubleshooting

**Port already in use:**
- Change ports in `docker-compose.yml`

**Hint feature not working:**
- Check that `OPENAI_API_KEY` is set in `.env`
- Verify API key has credits available

**Database connection errors:**
- Wait for health checks to pass (check `docker-compose logs`)
- Ensure ports 5432 and 27017 are available

## Future Enhancements

- [ ] User authentication and progress tracking
- [ ] Auto-grading with expected results comparison
- [ ] Leaderboards and achievements
- [ ] More assignment categories (joins, subqueries, window functions)
- [ ] Query execution history

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

---