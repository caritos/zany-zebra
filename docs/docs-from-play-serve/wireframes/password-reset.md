# Password Reset Completion Screen Wireframe

## Layout: Password Reset Completion Screen (From Email Link)

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         Reset Password              │
│                                     │
│     Enter your new password         │
│                                     │
│                                     │
│  New password                       │
│  ┌───────────────────────────────┐  │
│  │  🔒  Password                 │  │
│  │      ••••••••••••••           │  │
│  └───────────────────────────────┘  │
│                                     │
│                                     │
│  ┌───────────────────────────────┐  │
│  │      Update Password          │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

## Design Elements

### 🎨 Visual Style
- **No Header**: Clean, minimal layout without navigation
- **Background**: Clean, minimal background (light theme)
- **Typography**: Clear hierarchy with headline and subheading
- **Colors**: Consistent with app branding

### 📝 Content Sections

#### Hero Section
- **Headline**: "Reset Password"
- **Subheading**: "Enter your new password"
- **Purpose**: Clear instruction for password reset completion

#### Form Section
1. **New Password Input Field**
   - Lock icon (🔒)
   - Label: "New password"
   - Placeholder: "Password"
   - Secure text entry: true
   - Auto-capitalize: none

2. **Update Password Button**
   - Primary button style
   - Full width
   - Disabled when loading

## User Flow

```
Email Reset Link
    ↓ (Tap link)
┌─────────────┐
│  Password   │
│  Reset      │
│  Completion │
└─────┬───────┘
      │
      └── Update Password ──→ Login Screen (with success message)
```

## Form Validation & Behavior

### 🔒 New Password Requirements
- **Minimum length**: 6+ characters (Supabase default)
- **Real-time validation**: Check password strength as user types
- **Error handling**: Clear error messages for weak passwords

### 🔄 Loading States
- **Button state**: "Updating password..." during API call
- **Form disabled**: Prevent multiple submissions
- **Loading indicator**: Subtle spinner or progress feedback

## Implementation Considerations

### 🔧 Technical Requirements
- **URL Parameter**: Extract reset token from email link
- **Token Validation**: Verify reset token is valid and not expired
- **Password Update**: Use Supabase auth password reset completion
- **Error Handling**: Handle expired tokens and invalid requests
- **Auto-redirect**: Redirect to login after successful reset

### 📱 Accessibility Features
- **Screen reader support**: Proper labels and descriptions
- **Focus management**: Auto-focus on new password field
- **Error announcements**: Screen reader alerts for errors
- **Touch targets**: 44pt minimum button/input sizes

### 🎯 User Experience
- **Autofocus**: New password field focused on screen load
- **Clear instructions**: Simple, direct guidance
- **Error recovery**: Clear, actionable error messages
- **Success feedback**: Immediate transition to login with confirmation

## Component Structure

### Password Reset Completion Components
- **ResetPasswordHeadline**: Title and instruction text
- **PasswordResetForm**: New password input with validation
- **UpdatePasswordButton**: Primary action button

### Integration Points
- **Deep Linking**: Handle reset token from email URL
- **Authentication**: Supabase password reset completion
- **Navigation**: Redirect to login after success
- **Validation**: Password strength and match validation

## Error Handling

### Common Error Scenarios
1. **Invalid token**: "This password reset link is invalid or expired"
2. **Expired token**: "This password reset link has expired. Please request a new one"
3. **Weak password**: "Password must be at least 6 characters"
4. **Network errors**: "Unable to update password. Please try again"
5. **Server errors**: "Something went wrong. Please try again later"

### Error Display
- **Inline errors**: Below each input field
- **Alert errors**: For token/network errors
- **Visual states**: Red borders, error icons
- **Accessibility**: Screen reader announcements

## Success Flow

### After Successful Password Update
1. **Immediate feedback**: Success confirmation
2. **Auto-redirect**: Navigate to login screen
3. **Success message**: "Password updated successfully. Please log in with your new password"
4. **Pre-filled email**: Optionally pre-fill email if available

## Animation Opportunities
- **Screen transition**: Smooth entry from email link
- **Form focus**: Subtle highlight animations
- **Button press**: Tactile feedback on tap
- **Loading state**: Smooth loading animations
- **Success state**: Brief confirmation before redirect

## Platform Considerations
- **Deep Linking**: Handle email reset links across platforms
- **iOS**: Follow iOS design guidelines for secure forms
- **Android**: Material Design password input styling
- **Web**: Proper HTML5 form validation and security