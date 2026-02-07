# DonutSMP Discord Bot

A Discord bot that listens to webhook messages containing Minecraft usernames and responds with a clean embed showing DonutSMP player stats.

## Features
- Uses official DonutSMP Public API
- Authenticated via Bearer API key
- Displays:
  - Player head
  - Economy balance
  - Combat stats
  - World stats
  - Playtime & shards
- Webhook-driven (no jar changes needed)
- Render-compatible

## Setup

### Environment Variables
Set these in Render or locally via `.env`:

DISCORD_TOKEN=your_discord_bot_token  
DONUT_API_KEY=your_donutsmp_api_key  

### Run Locally
```bash
npm install
npm start
