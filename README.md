# NextGenBytes.ERP

Enterprise Resource Planning (ERP) system built with a Clean Architecture ASP.NET Core (.NET 10) backend and a React (Vite + TypeScript) frontend.

## Repository layout

```
.
├── backend/                  # ASP.NET Core (.NET 10) Web API
│   ├── docs/                 # Architecture, coding standards, business rules
│   ├── src/                  # NextGenBytes.ERP.{Api,Application,Domain,Infrastructure}
│   ├── tests/                # NextGenBytes.ERP.{UnitTests,IntegrationTests}
│   ├── AGENT.md
│   └── NextGenBytes.ERP.slnx
├── frontend/                 # React 19 + Vite + TypeScript SPA
│   ├── docs/
│   └── AGENT.md
├── database/
│   └── migration.sql
├── .github/                  # CI workflows (if any)
├── .gitignore
└── README.md
```

## Backend

```bash
cd backend
dotnet restore
dotnet build
dotnet test
dotnet run --project src/NextGenBytes.ERP.Api
```

The API runs at `http://localhost:5155` (HTTP) / `https://localhost:7088` (HTTPS) by default.

## Frontend

```bash
cd frontend
npm install
npm run dev     # development server on http://localhost:5173
npm run build   # production build
```

The Vite dev server proxies `/api` requests to the backend at `http://localhost:5155`.

## Database

The EF Core migrations live in the Infrastructure project (`src/NextGenBytes.ERP.Infrastructure/Migrations`). A standalone SQL script is kept in `database/migration.sql` for reference.
