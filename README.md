This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) that has been configured to work as a bundled DApp for Signet.

## Getting Started

### Development Mode

To run the app in development mode:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Bundled DApp Mode

To build the app as a bundled DApp for Signet:

```bash
npm run bundle
```

This will create a bundled version in the `dist` directory that can be loaded by Signet.

For more information on using this app as a bundled DApp, see [BUNDLED_DAPP_GUIDE.md](./BUNDLED_DAPP_GUIDE.md).

## Key Features

- **Signet Integration**: The app includes an `init` function that accepts a container and securityInterface object
- **Turbopack Integration**: Next.js with Turbopack for fast builds and bundling
- **Shadow DOM for CSS**: CSS styling is contained within a Shadow DOM for style isolation
- **Enhanced Bundling**: Automatic CSS extraction, tree shaking, code splitting, and TypeScript support
- **Manifest Configuration**: Properly configured manifest.json for Signet integration

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

To learn more about Signet DApp integration:

- [Bundled DApp Support](./docs/Bundled%20DApp%20Support.md) - learn about bundled DApp support in Signet
- [Signet DApp Security Interface](./docs/Signet%20DApp%20Security%20Interface.md) - learn about the security interface
