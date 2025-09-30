# Sign Up Screen Wireframe

## Layout: Sign Up Screen (From Welcome Screen)

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│            Sign up                  │
│                                     │
│      Just a few quick things to     │
│           get started               │
│                                     │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  👤  Full name                │  │
│  │      John Doe                 │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  📱  Phone number             │  │
│  │      (555) 123-4567           │  │
│  └───────────────────────────────┘  │
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
│                                     │
│  ┌───────────────────────────────┐  │
│  │        Create account         │  │
│  └───────────────────────────────┘  │
│                                     │
│   By creating an account, you      │
│   agree to our Terms of Service    │
│        and Privacy Policy          │
│                                     │
│     Already have an account?       │
│              Log in                 │
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
- **Headline**: "Sign up"
- **Subheading**: "Just a few quick things to get started"
- **Purpose**: Friendly, encouraging tone for new users

#### Form Section
1. **Full Name Input Field**
   - Person icon (👤)
   - Label: "Full name"
   - Placeholder: "John Doe"
   - Auto-capitalize: words
   - Text content type: name

2. **Phone Number Input Field**
   - Phone icon (📱)
   - Label: "Phone number"
   - Placeholder: "(555) 123-4567"
   - Keyboard type: phone-pad
   - Text content type: telephoneNumber

3. **Email Input Field**
   - Email icon (📧)
   - Label: "Email"
   - Placeholder: "email@address.com"
   - Auto-capitalize: none
   - Keyboard type: email

4. **Password Input Field**
   - Lock icon (🔒)
   - Label: "Password"
   - Placeholder: "Password"
   - Secure text entry: true
   - Auto-capitalize: none

5. **Create Account Button**
   - Primary button style
   - Full width
   - Disabled when loading

#### Footer Section
- **Terms Text**: "By creating an account, you agree to our Terms of Service and Privacy Policy"
- **Legal Links**: Terms of Service and Privacy Policy should be tappable links
- **Login Link**: "Already have an account? Log in"
- **Navigation**: Links to sign in mode or separate login screen

## User Flow

```
Welcome Screen
    ↓ (Sign up with email)
┌─────────────┐
│  Sign Up    │
│  Screen     │
│             │
└─────┬───────┘
      │
      ├── Create Account ────→ Account Screen (if successful)
      │
      └── Log in link ───────→ Login Screen
```

## Form Validation & Behavior

### 👤 Full Name Validation
- **Required field**: Must not be empty
- **Character limits**: Reasonable length constraints
- **Format validation**: Letters, spaces, hyphens, apostrophes allowed

### 📱 Phone Number Validation
- **Required field**: Must not be empty
- **Format validation**: Valid phone number format
- **Auto-formatting**: Format as user types (e.g., (555) 123-4567)
- **International support**: Support for different country formats

### 📧 Email Validation
- **Real-time validation**: Check email format as user types
- **Error states**: Show validation errors below field
- **Success states**: Visual confirmation of valid input

### 🔒 Password Requirements
- **Minimum length**: 6+ characters (Supabase default)
- **Visual feedback**: Password strength indicator (optional)
- **Error handling**: Clear error messages for weak passwords

### 🔄 Loading States
- **Button state**: "Creating account..." during API call
- **Form disabled**: Prevent multiple submissions
- **Loading indicator**: Subtle spinner or progress feedback

## Implementation Considerations

### 🔧 Technical Requirements
- **Form validation**: Client-side and server-side validation
- **Error handling**: Display Supabase auth errors to user
- **State management**: Track form data and submission state
- **Navigation**: Proper back navigation to Welcome screen

### 📱 Accessibility Features
- **Screen reader support**: Proper labels and descriptions
- **Focus management**: Logical tab order through form
- **Error announcements**: Screen reader alerts for errors
- **Touch targets**: 44pt minimum button/input sizes

### 🎯 User Experience
- **Autofocus**: Email field focused on screen load
- **Keyboard handling**: Auto-advance to next field
- **Error recovery**: Clear, actionable error messages
- **Success feedback**: Immediate transition to Account screen

## Component Structure

### SignUp Screen Components
- **SignUpHeadline**: "Sign up" title and subheading
- **SignUpForm**: Full name, phone number, email, and password inputs with validation
- **CreateAccountButton**: Primary action button
- **LegalFooter**: Terms of Service and Privacy Policy text with links
- **AuthFooter**: Login link

### Integration Points
- **Navigation**: React Navigation for screen transitions
- **Authentication**: Supabase auth signup
- **State**: Form state management (React Hook Form or similar)
- **Validation**: Form validation library integration

## Error Handling

### Common Error Scenarios
1. **Invalid email format**: "Please enter a valid email address"
2. **Weak password**: "Password must be at least 6 characters"
3. **Email already exists**: "An account with this email already exists"
4. **Network errors**: "Unable to create account. Please try again"
5. **Server errors**: "Something went wrong. Please try again later"

### Error Display
- **Inline errors**: Below each input field
- **Alert errors**: For general/network errors
- **Visual states**: Red borders, error icons
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