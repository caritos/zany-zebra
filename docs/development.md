# 20250922

- i can run the app on the simulator by running `npm run ios`
- i ran the command `npx testflight` successfully
  - this is an iOS-only ocmmand that will upload app to TestFlight
```
❯ npx testflight
Need to install the following packages:
testflight@1.0.4
Ok to proceed? (y) y

Need to install the following packages:
eas-cli@16.19.3
Ok to proceed? (y) y

npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated lodash.get@4.4.2: This package is deprecated. Use the optional chaining (?.) operator instead.
npm warn deprecated rimraf@2.4.5: Rimraf versions prior to v4 are no longer supported
npm warn deprecated @oclif/screen@3.0.8: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
npm warn deprecated glob@6.0.4: Glob versions prior to v9 are no longer supported
npm warn deprecated sudo-prompt@9.1.1: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
npm warn deprecated @xmldom/xmldom@0.7.13: this version is no longer supported, please update to at least 0.8.*
✔ Generated eas.json. Learn more: https://docs.expo.dev/build-reference/eas-json/
EAS project not configured.
✔ Would you like to automatically create an EAS project for @sotirac/zany-zebra? … yes
✔ Created @sotirac/zany-zebra: https://expo.dev/accounts/sotirac/projects/zany-zebra on EAS
✔ Linked local project to EAS project 314b8eea-dcae-4d94-96de-ba0f6c4446d6
Resolved "production" environment for the build. Learn more: https://docs.expo.dev/eas/environment-variables/#setting-the-environment-for-your-builds
No environment variables with visibility "Plain text" and "Sensitive" found for the "production" environment on EAS.

📝  iOS Bundle Identifier Learn more: https://expo.fyi/bundle-identifier
✔ What would you like your iOS bundle identifier to be? … com.caritos.zany-zebra
✔ iOS app only uses standard/exempt encryption? Learn more: https://developer.apple.com/documentation/Security/complying-with-encryption-export-regulations … yes
No remote versions are configured for this project, buildNumber will be initialized based on the value from the local project.
✔ Initialized buildNumber with 1.
✔ Using remote iOS credentials (Expo server)

If you provide your Apple account credentials we will be able to generate all necessary build credentials and fully validate them.
This is optional, but without Apple account access you will need to provide all the missing values manually and we can only run minimal validation on them.
✔ Do you want to log in to your Apple account? … yes

› Log in to your Apple Developer account to continue
✔ Apple ID: … eladio@caritos.com
› Restoring session /Users/eladio/.app-store/auth/eladio@caritos.com/cookie
› Session expired Local session
› Using password for eladio@caritos.com from your local Keychain
  Learn more: https://docs.expo.dev/distribution/security#keychain
✔ Logged in, verify your Apple account to continue
Two-factor Authentication (6 digit code) is enabled for eladio@caritos.com. Learn more: https://support.apple.com/en-us/HT204915

✔ How do you want to validate your account? … device / sms
✔ Please enter the 6 digit code … 941747
✔ Valid code
✔ Logged in and verified
› Team Eladio Caritos (3U8L77G9QV)
› Provider Eladio Caritos (122021101)
✔ Bundle identifier registered com.caritos.zany-zebra
✔ Synced capabilities: No updates
✔ Synced capability identifiers: No updates
✔ Fetched Apple distribution certificates
✔ Reuse this distribution certificate?
Cert ID: QX8HUJLK4N, Serial number: 42BD3F631A16DC8432AA0CD2838A7752, Team ID: 3U8L77G9QV, Team name: Eladio Caritos (Individual)
    Created: 1 month ago, Updated: 1 month ago,
    Expires: Tue, 11 Aug 2026 14:43:35 EDT
    📲 Used by: @sotirac/play-serve,@sotirac/comet … no
✔ Select the iOS distribution certificate to use for code signing: › [Add a new certificate]
✔ Generate a new Apple Distribution Certificate? … yes
✔ Created Apple distribution certificate
✔ Created distribution certificate
✔ Generate a new Apple Provisioning Profile? … yes
✔ Created Apple provisioning profile
✔ Created provisioning profile

Project Credentials Configuration

Project                   @sotirac/zany-zebra
Bundle Identifier         com.caritos.zany-zebra

App Store Configuration

Distribution Certificate
Serial Number             1A371F06BEF97EFFCD96CA3CC19625EC
Expiration Date           Tue, 22 Sep 2026 21:31:31 EDT
Apple Team                3U8L77G9QV (Eladio Caritos (Individual))
Updated                   5 seconds ago

Provisioning Profile
Developer Portal ID       PG4DFQNAYC
Status                    active
Expiration                Tue, 22 Sep 2026 21:31:31 EDT
Apple Team                3U8L77G9QV (Eladio Caritos (Individual))
Updated                   0 second ago

All credentials are ready to build @sotirac/zany-zebra (com.caritos.zany-zebra)


Compressing project files and uploading to EAS Build. Learn more: https://expo.fyi/eas-build-archive
✔ Uploaded to EAS 1s
✔ Computed project fingerprint

See logs: https://expo.dev/accounts/sotirac/projects/zany-zebra/builds/d589fc7c-2863-48e7-9c7b-b8178c5d7d38

Ensuring your app exists on App Store Connect. This step can be skipped by providing ascAppId in the submit profile. Learn more: https://expo.fyi/asc-app-id

✔ Bundle identifier registered com.caritos.zany-zebra
✔ Prepared App Store Connect for zany-zebra com.caritos.zany-zebra
✔ TestFlight group created: Team (Expo)
TestFlight access enabled for: eladio@caritos.com
Looking up credentials configuration for com.caritos.zany-zebra...
✔ Fetched App Store Connect API Keys.
✔ Reuse this App Store Connect API Key?
Key ID: RSH6WGYB5Q
    Name: [Expo] EAS Submit SU8hOQlxz8
    Team ID: 3U8L77G9QV, Team name: Eladio Caritos (Individual)
    Updated: 1 month ago … yes
Using App Store Connect API Key with ID RSH6WGYB5Q
✔ App Store Connect API Key assigned to zany-zebra: com.caritos.zany-zebra for EAS Submit.
Using Api Key ID: RSH6WGYB5Q ([Expo] EAS Submit SU8hOQlxz8)

ASC App ID:                 6752880741
Project ID:                 314b8eea-dcae-4d94-96de-ba0f6c4446d6
App Store Connect API Key:
    Key Name  :  [Expo] EAS Submit SU8hOQlxz8
    Key ID    :  RSH6WGYB5Q
    Key Source:  EAS servers
Build:
    Build ID    :  d589fc7c-2863-48e7-9c7b-b8178c5d7d38
    Build Date  :  9/22/2025, 9:41:41 PM
    App Version :  1.0.0
    Build number:  1

✔ Scheduled iOS submission

Submission details: https://expo.dev/accounts/sotirac/projects/zany-zebra/submissions/93156645-567f-4c6f-83be-578fa52d916c

Waiting for build to complete. You can press Ctrl+C to exit.
✔ Build finished

🍏 iOS app:
https://expo.dev/artifacts/eas/snokcke7rDMy7v7oqRNbsL.ipa

Waiting for submission to complete. You can press Ctrl+C to exit.
✔ Submitted your app to Apple App Store Connect!

Your binary has been successfully uploaded to App Store Connect!
- It is now being processed by Apple - you will receive an email when the processing finishes.
- It usually takes about 5-10 minutes depending on how busy Apple servers are.
- When it's done, you can see your build here: https://appstoreconnect.apple.com/apps/6752880741/testflight/ios
```
