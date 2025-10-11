# Developer Toolbox 🛠️

A comprehensive, production-ready developer toolbox built with React, TypeScript, and Vite.

## Features

- 🔐 **Base64 Encoding/Decoding**
- 🔗 **URL Encoding/Decoding**
- 📋 **JSON Formatter & Validator**
- 🔑 **Hash Generator** (MD5, SHA-1, SHA-256)
- ⏰ **Timestamp Converter**
- 🔤 **Unicode Converter**
- 🎨 **Color Converter** (HEX, RGB, HSL)
- 🔍 **Regex Tester**

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Project Structure

```
src/
├── components/          # React components
│   ├── common/         # Reusable UI components
│   ├── layout/         # Layout components
│   └── tools/          # Tool-specific components
├── utils/              # Utility functions
│   ├── encoders/       # Encoding utilities
│   ├── converters/     # Conversion utilities
│   └── validators/     # Validation utilities
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── constants/          # Constants and configurations
└── styles/             # Global styles

```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type check
npm run type-check
```

## Code Style

This project follows strict coding standards:

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for consistent formatting
- **Functional components** with hooks
- **Clear naming conventions**
- **Comprehensive documentation**

## License

MIT
