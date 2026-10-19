# Project Development Rules

## 1. Backend Ownership
- **Never Touch Backend**: The `backend/` directory is developed by another developer/team. Never edit, add, or delete files inside `backend/`.

## 2. Data Integrity and Frontend Integration
- **Strictly No Mock Data**: Never use mock, stubbed, or fake hardcoded numbers/records in the frontend apps (`customerapp`, `driverApp`, `staffwebdashbaord`).
- **Real Backend Data Only**: Connect exclusively to real backend endpoints.
- **Handling Unimplemented Endpoints**: If backend endpoints for a feature are not yet completed by the backend team, display real empty states, zero counters, or disabled action states with appropriate messaging instead of hardcoding fake data (such as fake drivers, fake trips, or fake earnings).

