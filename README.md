# Token Platform

A Next.js application for displaying and trading tokens on the Solana blockchain.

## Features

- Real-time token updates via WebSocket connection
- Solana wallet integration (Phantom, Solflare, Backpack)
- Buy/sell tokens directly from the interface
- View token details, prices, and market data
- Create new tokens

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## Usage

### Connect Your Wallet

Click the "Connect Wallet" button in the top navigation to connect your Solana wallet (Phantom, Solflare, or Backpack).

### Viewing Tokens

The home page displays tokens in three categories:
- New Tokens (<$10K market cap)
- Bonding Tokens ($10K - $50K market cap)
- Graduated Tokens (>$50K market cap)

### Trading Tokens

To trade a token:
1. Click the "Trade" button on any token card
2. A dialog will open with buy/sell options
3. Enter the amount you want to trade
4. Click "Buy" or "Sell" to execute the trade

Alternatively, you can go to the "/trade" page to trade any token by entering its Contract Address (CA).

### Creating Tokens

To create a new token, click the "Create Coin" button and follow the instructions.

## Architecture

- Next.js frontend with React components
- Solana wallet adapter for wallet connections
- Real-time updates via WebSocket
- API routes for trade execution

## Dependencies

- Next.js
- React
- @solana/wallet-adapter-react
- @solana/web3.js
- shadcn/ui components
- Tailwind CSS

## updated the database with supabase
just just need to create .env.local 
paste you supabse_project_url = **************************
you supabase anon link = **************************

## updated the bounding curve of each newly created token through gprc which i got through a github repo
## will update the github link also later

# update the trading viewchart using gmgn api protal soo now we can fetch the it here is the docs link -  https://docs.bitquery.io/docs/examples/dextrades/evm-gmgn-api/
