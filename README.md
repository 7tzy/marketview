# Financial Dashboard - Offline Mirror

This is a complete offline mirror of the Financial Dashboard that works independently without requiring internet connectivity.

## Features

### Offline Functionality
- ✅ Complete UI and navigation
- ✅ User authentication system (local file-based)
- ✅ Financial resources section (all links functional)
- ✅ User preferences and settings
- ✅ Theme switching (light/dark mode)
- ✅ Color theme variations

### Offline Messages
When offline, the following features display appropriate messages:
- 📱 Market Overview: "You are offline, please go online to use Market Overview"
- 📊 Stock Lists: "You are offline, please go online to use Your Lists"

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Start the application:
```bash
npm run dev
```

3. Access the application at: http://localhost:5001

## Key Differences from Online Version

1. **No External API Calls**: All market data endpoints return offline messages
2. **Local Storage**: User data is stored locally in JSON files
3. **Independent Operation**: Completely self-contained without external dependencies
4. **Identical UI**: All visual elements and interactions remain the same

## File Structure

- `client/` - React frontend application
- `server/` - Express backend server
- `shared/` - Shared TypeScript schemas
- `server/data/` - Local data storage

## Notes

This offline mirror maintains full functionality for all non-market-data features and provides clear messaging when online features are needed.