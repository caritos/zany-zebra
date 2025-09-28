# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Expo React Native application using Expo Router for file-based navigation. The project is configured for iOS and Android development with TypeScript support.

## Essential Commands

### Development
- `npm run start` - Start the Expo development server
- `npm run ios` - Start the app in iOS simulator
- `npm run android` - Start the app in Android emulator
- `npm run web` - Start the app for web development

### Code Quality
- `npm run lint` - Run ESLint to check code quality

### Deployment
- `npx testflight` - Upload iOS app to TestFlight (iOS only)
- `npx eas build` - Build the app using EAS Build service

### Project Management
- `npm run reset-project` - Reset project to blank state (moves starter code to app-example directory)

## Architecture

### Navigation Structure
The app uses Expo Router with file-based routing:
- `app/_layout.tsx` - Root layout with theme provider and stack navigation
- `app/(tabs)/_layout.tsx` - Tab navigation layout with Home and Explore tabs
- `app/(tabs)/index.tsx` - Home screen
- `app/(tabs)/explore.tsx` - Explore screen
- `app/modal.tsx` - Modal screen

### Key Dependencies
- **Expo SDK 54** - Core framework
- **Expo Router** - File-based navigation
- **React Navigation** - Navigation primitives
- **React Native Reanimated** - Animation library
- **TypeScript** - Type safety with strict mode enabled

### Project Configuration
- **Bundle ID**: `com.caritos.zany-zebra`
- **EAS Project ID**: `314b8eea-dcae-4d94-96de-ba0f6c4446d6`
- **Path aliases**: `@/*` maps to root directory
- **TypeScript**: Strict mode enabled
- **React Compiler**: Experimental feature enabled
- **New Architecture**: Enabled for React Native

### Component Organization
- `components/` - Reusable UI components
  - `themed-*.tsx` - Theme-aware components
  - `ui/` - Core UI primitives like IconSymbol
  - Component-specific functionality (e.g., HapticTab, HelloWave)
- `hooks/` - Custom React hooks for theme and color scheme
- `constants/` - App constants including theme definitions

### Theme System
The app implements automatic light/dark mode switching:
- Theme detection via `useColorScheme` hook
- Theme provider wraps the entire app
- Components use `useThemeColor` for consistent theming

## Development Notes

The project includes development logs in `/docs/development.md` that document deployment history and configuration changes.
- in the app, let's refer to the postgis region as "club"
- always use full table names in queries
- all database functions should be stored in /database/functions/