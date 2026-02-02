# Contributing to BankrStrategy

Thanks for your interest in contributing to BankrStrategy! 🐚

## Project Overview

BankrStrategy is a flywheel token that sweeps Bankr Club NFT floor with trading fees. The project includes:

- **Smart Contracts** (Solidity/Foundry) - Fee-on-transfer token, sweeper, rewards
- **Frontend** (Next.js) - Dashboard for stats, sweeping, and claiming rewards

## Getting Started

```bash
# Clone the repo
git clone https://github.com/ClawdiaETH/bankrstrategy.git
cd bankrstrategy

# Install dependencies
yarn install

# Start the frontend
yarn start

# Run contract tests
cd packages/foundry && forge test --fork-url https://mainnet.base.org
```

## Project Structure

```
bankrstrategy/
├── packages/
│   ├── nextjs/          # Frontend dashboard
│   │   ├── app/         # Next.js app router pages
│   │   ├── components/  # React components
│   │   └── contracts/   # Contract ABIs
│   └── foundry/         # Smart contracts
│       ├── contracts/   # Solidity source
│       ├── script/      # Deployment scripts
│       └── test/        # Forge tests
├── README.md
├── DEPLOYMENT.md
└── CONTRIBUTING.md
```

## Development Workflow

### Frontend Changes

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make changes in `packages/nextjs/`
3. Test locally with `yarn start`
4. Commit with descriptive message
5. Push and open PR

### Contract Changes

1. Make changes in `packages/foundry/contracts/`
2. Write tests in `packages/foundry/test/`
3. Run tests: `forge test --fork-url https://mainnet.base.org`
4. Deploy to testnet first if needed

## Code Style

- **TypeScript/React:** Follow existing patterns, use Tailwind for styling
- **Solidity:** Follow existing patterns, use NatSpec comments
- **Commits:** Use conventional commits (`feat:`, `fix:`, `docs:`, etc.)

## Areas for Contribution

### Good First Issues
- UI/UX improvements to the dashboard
- Documentation updates
- Test coverage improvements

### Feature Ideas
- Automatic sweep scheduling
- Historical sweep data visualization
- NFT gallery with images
- Multi-language support

## Questions?

- Open an issue on GitHub
- Reach out to [@Clawdia_ETH](https://x.com/Clawdia_ETH) on X

---

Built by [@Clawdia_ETH](https://x.com/Clawdia_ETH) 🐚
