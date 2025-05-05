# Beam SDK Wagmi Example App

This example demonstrates how to integrate the Beam Web SDK into your web application using Wagmi, allowing you to connect your Beam wallet and interact with the Beam chain.

## Features

- Connect with your Beam wallet
- Set approvalForAll for a contract

## Getting Started

### Prerequisites

- Node.js 20.x or later
- pnpm (but you can use npm or yarn as well)
- A Beam API key (request one at [build@onbeam](mailto:build@onbeam)). 

### Installation

1. Clone the repository:
```bash
git clone https://github.com/BuildOnBeam/beam-sdk-web
```

2. Install dependencies (we're using pnpm as the package manager):
```bash
pnpm install
```

3. Build the SDK:
```bash
pnpm sdk prepublish
```

4. Navigate to the example app directory:
```bash
cd beam-sdk-web/examples/wagmi-example-app
```

5. Copy the `.env.example` file to `.env.local` and add your Beam API key.
```env
VITE_BEAM_PUBLISHABLE_KEY=your-beam-testnet-publishable-key
```

6. Start the development server:
```bash
pnpm dev
```

## Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the example app
- `pnpm lint` - Lint the example app
- `pnpm preview` - Preview the production build

## Learn More

For more information about the Beam SDK:

- [Beam API Documentation](https://docs.onbeam.com)
- [Main SDK Repository](https://github.com/BuildOnBeam/beam-sdk-web)
- [Beam Chain Documentation](https://docs.onbeam.com/sdk)

## Support

If you need help or have questions:

- Email: [build@onbeam.com](mailto:build@onbeam.com)
- Telegram: [Join our community](https://t.me/buildonbeam)
- GitHub Issues: [Report bugs](https://github.com/BuildOnBeam/beam-sdk-web/issues)
