# Matvelgeren - Smart Shopping & Recipe Management App 🛒👨‍🍳

Matvelgeren is a comprehensive mobile application built with React Native and Expo that combines smart shopping features with recipe management. The app helps users discover recipes, scan product barcodes, manage shopping carts, and streamline their grocery shopping experience.

## ✨ Features

- **📱 Barcode Scanner**: Scan product barcodes to quickly add items to your shopping cart
- **🍳 Recipe Management**: Browse, search, and save your favorite recipes
- **🛒 Smart Shopping Cart**: Organize and manage your shopping lists
- **🔍 Product Search**: Find products and get detailed information
- **👤 User Profile**: Personalized user experience with profile management
- **🔐 Authentication**: Secure login and user management with Supabase
- **📊 Visual Charts**: Track shopping patterns and recipe analytics
- **🌐 Multi-platform**: Works on iOS, Android, and Web

## 🎥 Demo Video

* A comprehensive demo video showcasing all app features will be available here.*
* [![Watch the video](https://img.youtube.com/vi/vpg7LiCzP9w/0.jpg)](https://youtu.be/vpg7LiCzP9w)


## 🚀 Technology Stack

- **Frontend**: React Native 0.79.2 with TypeScript 5.8.3
- **Framework**: Expo 53.0.9
- **Backend**: Supabase for authentication and data management
- **Navigation**: React Navigation with tab-based navigation
- **State Management**: React hooks and context
- **Camera**: Expo Camera for barcode scanning
- **Charts**: React Native Chart Kit for data visualization
- **UI Components**: Custom components with React Native SVG

## 📱 App Structure

- **Authentication Flow**: Secure login and registration
- **Main Tabs**:
  - 🏠 **Home**: Dashboard and overview
  - 🔍 **Search**: Product and recipe search
  - 📷 **Scanner**: Barcode scanning functionality
  - 🍳 **Recipes**: Recipe browsing and management
  - 🛒 **Cart**: Shopping cart management
  - 👤 **Profile**: User settings and preferences

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## 🛠️ Development

This project is structured using:
- **File-based routing** with Expo Router
- **TypeScript** for type safety
- **Component-based architecture** with reusable UI components
- **API integration** with external services
- **Testing** with Jest and React Native Testing Library

### Key Directories

- `/app` - Main application screens and routing
- `/components` - Reusable UI components
- `/lib` - Utility libraries and configurations
- `/utils` - Helper functions and utilities
- `/api` - API integration and services
- `/assets` - Images, fonts, and other static assets

## 🧪 Testing

Run the test suite:

```bash
npm test
```
