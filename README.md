# Deel Payslips App 📄

A React Native mobile application for viewing, downloading, and managing employee payslips. Built with Expo for a seamless cross-platform experience on iOS and Android.

---

## 📱 Features

- **Payslip List** — Browse all payslips with date-based filtering and sorting
- **Search & Filter** — Filter payslips by ID, month, or year
- **Sorting** — Sort by newest or oldest first
- **Payslip Details** — View detailed information for each payslip
- **Download** — Save payslips to device storage (with Android SAF support)
- **Preview** — Open payslips using native viewers/share sheet
- **Dark Mode** — Automatic dark/light theme support

---

## 🛠 Tech Stack & Architecture Choices

### Framework
| Technology | Version | Why |
|------------|---------|-----|
| **Expo** | SDK 54 | Managed workflow for faster development, OTA updates, and simplified native configuration |
| **React Native** | 0.81.5 | Cross-platform mobile development with native performance |
| **React** | 19.1.0 | Latest React with improved performance and concurrent features |

### Navigation
| Library | Purpose |
|---------|---------|
| **Expo Router** | File-based routing for intuitive navigation structure |
| **React Navigation** | Underlying navigation primitives and screen transitions |

### State Management
| Approach | Why |
|----------|-----|
| **React Context** | Lightweight state management for payslip data, filtering, and sorting without additional dependencies |

### File Handling
| Library | Purpose |
|---------|---------|
| **expo-file-system** | Read/write files to device storage |
| **expo-sharing** | Native share sheet for file preview on iOS |
| **expo-intent-launcher** | Open files with appropriate apps on Android |
| **expo-asset** | Bundle and manage static assets |

### Developer Experience
| Tool | Purpose |
|------|---------|
| **TypeScript** | Type safety and better IDE support |
| **ESLint** | Code linting and style enforcement |

### Why Expo over React Native CLI?

1. **Faster Setup** — No need to configure Xcode/Android Studio build systems manually
2. **OTA Updates** — Push updates without app store submissions
3. **Managed Native Modules** — Common native features work out of the box
4. **New Architecture Ready** — `newArchEnabled: true` for Fabric and TurboModules

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x (recommended: use `nvm`)
- **npm** or **yarn**
- **iOS Development** (macOS only):
  - Xcode 15+
  - Xcode Command Line Tools: `xcode-select --install`
  - CocoaPods: `sudo gem install cocoapods`
- **Android Development**:
  - Android Studio (latest stable)
  - Android SDK (API 34+)
  - Java 17 (comes with Android Studio)
  - Set `ANDROID_HOME` environment variable

### Installation

```bash
# Clone the repository
git clone https://github.com/SurajMDurgad/deel-interview
cd deel-interview

# Install dependencies
npm install
```

### Running the App

#### iOS Simulator

```bash
# Start Metro bundler and run on iOS simulator
npm run ios
```

#### Android Emulator

```bash
# Start Metro bundler and run on Android emulator
npm run android
```

#### Physical Devices

```bash
# Start the development server
npx expo start

# Scan QR code with:
# - iOS: Camera app
# - Android: Expo Go app
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run ios` | Build and run on iOS simulator |
| `npm run android` | Build and run on Android emulator |
| `npm run web` | Start web version |
| `npm run lint` | Run ESLint |
| `npm run reset-project` | Reset to blank project template |

