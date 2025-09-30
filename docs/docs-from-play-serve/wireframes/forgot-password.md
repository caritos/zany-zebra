# Check Your Email Screen Wireframe

## Layout: Check Your Email Screen (After Password Reset Request)

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
│        Check Your Email             │
│                                     │
│   We've sent a password reset       │
│         link to:                    │
│     user@example.com               │
│                                     │
│   Please check your inbox and      │
│   follow the link to reset your    │
│   password. The link will expire   │
│          in 1 hour.                 │
│                                     │
│  ┌───────────────────────────────┐  │
│  │      Return to Login          │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

## Design Elements

### 🎨 Visual Style
- **No Header**: Clean, minimal layout without navigation header
- **Background**: Clean, minimal background (light theme)
- **Typography**: Clear hierarchy with headline and descriptive text
- **Colors**: Consistent with app branding

### 📝 Content Sections

#### Hero Section
- **Headline**: "Check Your Email"
- **Purpose**: Clear confirmation that email was sent successfully

#### Confirmation Section
- **Confirmation Text**: "We've sent a password reset link to:"
- **Email Display**: Shows the email address where reset link was sent
- **Styling**: Email address should be prominent/bold
- **Instructions**: "Please check your inbox and follow the link to reset your password. The link will expire in 1 hour."

#### Action Section
1. **Return to Login Button**
   - Primary button style
   - Full width
   - Text: "Return to Login"
   - Navigation: Returns to login screen


## User Flow

```
Forgot Password Screen
    ↓ (Send Reset Link - Success)
┌─────────────────┐
│  Check Your     │
│  Email Screen   │
│                 │
└─────────┬───────┘
          │
          └── Return to Login ────→ Login Screen
```

## Implementation Considerations

### 🔧 Technical Requirements
- **Dynamic Email Display**: Show the actual email address used
- **State Management**: Track successful password reset request
- **Navigation**: Proper navigation to login and back to forgot password
- **Timer Logic**: Optional countdown for link expiration (1 hour)

### 📱 Accessibility Features
- **Screen reader support**: Proper labels and descriptions for success state
- **Focus management**: Auto-focus on primary button
- **Success announcements**: Screen reader alerts for successful email send
- **Touch targets**: 44pt minimum button/input sizes

### 🎯 User Experience
- **Clear success feedback**: Visual and textual confirmation
- **Next step guidance**: Clear instructions on what to do next
- **Single clear action**: Return to login option
- **Time awareness**: Inform user about link expiration
- **Email verification**: Show which email received the reset link

## Component Structure

### Check Your Email Screen Components
- **CheckEmailHeadline**: Title and confirmation messaging
- **EmailConfirmation**: Display of email address and instructions
- **ReturnToLoginButton**: Primary navigation button

### Integration Points
- **Navigation**: React Navigation for screen transitions
- **State**: Email address from previous screen
- **Timer**: Optional countdown for link expiration
- **Email Service**: Integration with email delivery status

## Content Variations

### Dynamic Email Display
- **Successful Send**: "We've sent a password reset link to: {email}"
- **Instructions**: "Please check your inbox and follow the link to reset your password."
- **Expiration Notice**: "The link will expire in 1 hour."

### Available Actions
- **Primary Action**: "Return to Login" - takes user back to login
- **Optional Enhancement**: "Resend email" (if needed) - sends another reset email

## Error Handling

### Edge Cases
1. **Email delivery delays**: Inform user emails may take a few minutes
2. **Spam folder**: Remind user to check spam/junk folders
3. **Wrong email**: User can restart process from login screen
4. **Link expiration**: Clear messaging about 1-hour expiration

### User Guidance
- **Inbox Instructions**: Clear steps on what to look for in email
- **Troubleshooting**: Common issues and solutions
- **Support Options**: Contact information if issues persist

## Success States

### Visual Feedback
- **Clear messaging**: Simple text-based confirmation
- **Confirmation text**: Explicit confirmation of action
- **Email display**: Verification of correct email address
- **Next steps**: Clear guidance on what to do next

### Visual Focus
1. **Clean Design**: Simple headline with "Check Your Email"
2. **Clear Action**: Single path forward to login

## Animation Opportunities
- **Text animation**: Smooth entry animation for headline
- **Email highlight**: Subtle animation drawing attention to email address
- **Button interactions**: Tactile feedback on tap
- **Loading states**: If implementing resend functionality

## Platform Considerations
- **iOS**: Follow iOS design guidelines for success states
- **Android**: Material Design success indicators
- **Web**: Proper HTML structure for screen readers
- **Email Integration**: Deep linking from email reset links