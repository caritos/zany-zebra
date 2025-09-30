# Welcome Login Screen Wireframe

## Layout: Welcome Login Screen (App Entry Point)

```
┌─────────────────────────────────────┐
│                                     │
│         🟢 Play Serve               │
│                                     │
│   Connect with Tennis Players       │
│     in your Neighborhood           │
│                                     │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  📧  Email                    │  │
│  │      email@address.com        │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🔒  Password                 │  │
│  │      ••••••••••••••           │  │
│  └───────────────────────────────┘  │
│                                     │
│           Forgot password?          │
│                                     │
│  ┌───────────────────────────────┐  │
│  │          Log in               │  │
│  └───────────────────────────────┘  │
│                                     │
│     Don't have an account?         │
│            Sign up                  │
│                                     │
│    Terms of Service | Privacy Policy │
│                                     │
└─────────────────────────────────────┘
```

## Design Elements

### 🎨 Visual Style
- **No Header**: Clean, minimal layout without navigation header
- **Background**: Clean, minimal background (light theme)
- **Typography**: Clear hierarchy with headline and subheading
- **Colors**: Consistent with app branding

### 📝 Content Sections

#### Hero Section
- **App Logo/Brand**: "🟢 Play Serve" - Clean branding at top
- **Headline**: "Connect with Tennis Players in your Neighborhood" - Clear value proposition
- **Purpose**: Focused on local tennis player connections with immediate login access

#### Form Section
1. **Email Input Field**
   - Email icon (📧)
   - Label: "Email"
   - Placeholder: "email@address.com"
   - Auto-capitalize: none
   - Keyboard type: email
   - Text content type: emailAddress

2. **Password Input Field**
   - Lock icon (🔒)
   - Label: "Password"
   - Placeholder: "Password"
   - Secure text entry: true
   - Auto-capitalize: none
   - Text content type: password

3. **Forgot Password Link**
   - Text link positioned between password field and login button
   - Label: "Forgot password?"
   - Smart behavior: Auto-sends reset email using email field value
   - Styling: Secondary text color, underlined on tap
   - Interactive states based on email field validation

4. **Log In Button**
   - Primary button style
   - Full width
   - Disabled when loading

#### Footer Section
- **Sign Up Link**: "Don't have an account? Sign up"
- **Legal Links**: "Terms of Service | Privacy Policy"
- **Navigation**: Links to sign up screen and legal documents

## User Flow

```
App Launch
    ↓
┌─────────────────┐
│  Welcome Login  │
│  Screen         │
│                 │
└─────────┬───────┘
          │
          ├── Log in ─────────────→ Profile Screen (if successful)
          │
          ├── Forgot password? ──→ Check Your Email Screen (auto-send)
          │
          ├── Sign up ───────────→ Sign Up Screen
          │
          └── Legal links ───────→ Web View (Terms/Privacy)
```

## Form Validation & Behavior

### 📧 Email Validation
- **Real-time validation**: Check email format as user types
- **Error states**: Show validation errors below field
- **Success states**: Visual confirmation of valid input
- **Required field**: Must not be empty

### 🔒 Password Validation
- **Required field**: Must not be empty
- **No minimum length**: Allow any password for login (validation happens server-side)
- **Error handling**: Show authentication errors from Supabase

### 🔗 Forgot Password Interaction States
- **Email field empty/invalid**: Forgot password link disabled (grayed out)
- **Email field valid**: Forgot password link enabled (clickable)
- **After click**: Auto-sends reset email using email field value
- **Success**: Navigate to Check Your Email screen
- **Loading**: "Sending reset email..." feedback
- **Error**: Show inline error message below link

### 🔄 Loading States
- **Login button**: "Logging in..." during API call
- **Forgot password**: "Sending reset email..." during reset request
- **Form disabled**: Prevent multiple submissions during any loading state
- **Loading indicator**: Subtle spinner or progress feedback

## Implementation Considerations

### 🔧 Technical Requirements
- **Form validation**: Client-side and server-side validation
- **Error handling**: Display Supabase auth errors to user
- **State management**: Track form data and submission state
- **Email validation**: Real-time validation for forgot password link enablement
- **Password reset**: Auto-send functionality without intermediate screen
- **App entry point**: Handle first-time users and returning users

### 📱 Accessibility Features
- **Screen reader support**: Proper labels and descriptions
- **Focus management**: Logical tab order through form
- **Error announcements**: Screen reader alerts for errors
- **Touch targets**: 44pt minimum button/input sizes

### 🎯 User Experience
- **Immediate access**: Login form available on app launch
- **Clear branding**: App identity and value proposition visible
- **Autofocus**: Email field focused on screen load
- **Clear navigation**: Easy path to signup for new users
- **Error recovery**: Clear, actionable error messages
- **Success feedback**: Immediate transition to main app

## Component Structure

### Welcome Login Screen Components
- **AppBranding**: "🟢 Play Serve" logo/title and headline
- **LoginForm**: Email and password inputs with validation
- **ForgotPasswordLink**: Smart password reset link
- **LoginButton**: Primary action button
- **SignUpFooter**: Sign up link and legal links

### Integration Points
- **Navigation**: React Navigation for screen transitions
- **Authentication**: Supabase auth signin
- **State**: Form state management (React Hook Form or similar)
- **Validation**: Form validation library integration

## Error Handling

### Common Error Scenarios
1. **Invalid email format**: "Please enter a valid email address"
2. **Empty fields**: "Please enter your email and password"
3. **Invalid credentials**: "Invalid email or password"
4. **User not found**: "No account found with this email"
5. **Too many attempts**: "Too many login attempts. Please try again later"
6. **Password reset errors**: "Unable to send reset email. Please try again"
7. **No account for reset**: "No account found with this email address"
8. **Network errors**: "Unable to log in. Please try again"
9. **Server errors**: "Something went wrong. Please try again later"

### Error Display
- **Inline errors**: Below each input field and forgot password link
- **Alert errors**: For general authentication errors
- **Toast messages**: For password reset confirmations and errors
- **Visual states**: Red borders, error icons, disabled link styling
- **Accessibility**: Screen reader announcements

## Animation Opportunities
- **Screen transition**: Slide in from right (from Welcome)
- **Form focus**: Subtle highlight animations
- **Button press**: Tactile feedback on tap
- **Loading state**: Smooth loading animations
- **Error states**: Gentle shake or fade-in for errors

## Platform Considerations
- **iOS**: Follow iOS design guidelines for forms
- **Android**: Material Design input styling
- **Web**: Proper HTML5 form validation
- **Keyboard**: Appropriate keyboard types for each input
- **Password managers**: Support autofill for credentials