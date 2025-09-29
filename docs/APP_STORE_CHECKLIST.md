# App Store Release Checklist

## ✅ Completed Tasks
- [x] Fixed TestFlight startup issue (environment variables)
- [x] Updated app display name to "FifteenAll"
- [x] Updated location permission descriptions with specific use cases
- [x] Verified privacy policy and terms of service pages exist
- [x] Configured app icons and splash screens

## 📱 Before Submission

### 1. Testing
- [ ] Test all critical user flows on real device via TestFlight:
  - [ ] Login/signup flow
  - [ ] Password reset flow
  - [ ] Profile creation and editing
  - [ ] Club joining/creation
  - [ ] Match recording
  - [ ] Stats viewing
- [ ] Test on multiple iOS versions (iOS 12.0 minimum)
- [ ] Test on different iPhone sizes
- [ ] Test dark mode and light mode
- [ ] Verify offline behavior

### 2. App Store Connect Setup
- [ ] Create app in App Store Connect
- [ ] Upload app icon (1024x1024 PNG, no transparency)
- [ ] Prepare screenshots:
  - [ ] 6.5" iPhone (1284 × 2778 or 1242 × 2688)
  - [ ] 5.5" iPhone (1242 × 2208)
  - [ ] iPad Pro 12.9" (2048 × 2732) if supporting iPad

### 3. App Information
- [ ] App Name: "FifteenAll"
- [ ] Subtitle: "Tennis clubs, matches & rankings"
- [ ] Primary Category: Sports
- [ ] Secondary Category: Social Networking
- [ ] Age Rating: 4+
- [ ] Copyright: "© 2025 Your Company Name"

### 4. App Description Template
```
FifteenAll makes it easy to connect with local tennis players, join clubs, and track your match history.

KEY FEATURES:
• Find and join tennis clubs in your area
• Record match results and track statistics
• View your ranking and performance trends
• Connect with other players
• Schedule matches with club members

Whether you're a beginner or advanced player, FifteenAll helps you improve your game and connect with the tennis community.

PRIVACY FIRST:
Your data is secure and private. We only use location when you search for nearby clubs.
```

### 5. Keywords
```
tennis, club, sports, match, tracking, players, ranking, statistics, community, recreational
```

### 6. Privacy & Legal
- [ ] Privacy Policy URL: https://yourwebsite.com/privacy-policy
- [ ] Terms of Use URL: https://yourwebsite.com/terms-of-service
- [ ] Support URL: https://yourwebsite.com/support
- [ ] Marketing URL (optional): https://yourwebsite.com

### 7. Build Configuration
- [ ] Set version to 1.0.0 (or increment if updating)
- [ ] Increment build number
- [ ] Ensure production environment variables
- [ ] Remove console.log statements
- [ ] Enable crash reporting (if using)

### 8. Final Build Commands
```bash
# Clean and rebuild
npx expo prebuild --clean

# Build for production
npx eas build --platform ios --profile production

# Or use TestFlight command
npx testflight
```

### 9. App Review Notes
Include notes for Apple reviewers:
- Test account credentials (if needed)
- How to access all features
- Any special instructions

### 10. Common Rejection Reasons to Avoid
- [ ] Ensure app is complete (no placeholder content)
- [ ] Remove any beta/test labels
- [ ] Verify all links work
- [ ] No crashes or bugs
- [ ] Accurate app description
- [ ] Appropriate permission usage
- [ ] No copyright infringement
- [ ] Working sign-up process

## 🚀 Submission Process

1. Upload build to App Store Connect using:
   ```bash
   npx eas submit --platform ios
   ```

2. In App Store Connect:
   - Add build to version
   - Fill in all required fields
   - Submit for review

3. Expected review time: 24-48 hours

## 📞 Post-Launch

- Monitor crash reports
- Respond to user reviews
- Plan regular updates
- Track analytics

## Notes
- Current Bundle ID: `com.caritos.zany-zebra`
- EAS Project ID: `314b8eea-dcae-4d94-96de-ba0f6c4446d6`
- Minimum iOS: 12.0
- Orientation: Portrait only