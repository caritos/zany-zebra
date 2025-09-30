# Profile Screen Wireframe

## Layout: Profile Screen (After Successful Login/Signup)

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│             Profile                 │
│                                     │
│                                     │
│                                     │
│  Full name                          │
│  ┌───────────────────────────────┐  │
│  │  John Doe                     │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  Email                              │
│  ┌───────────────────────────────┐  │
│  │  john.doe@example.com         │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  Phone number                       │
│  ┌───────────────────────────────┐  │
│  │  (555) 123-4567               │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│                                     │
│  ┌───────────────────────────────┐  │
│  │         Sign Out              │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

## Design Elements

### 🎨 Visual Style
- **Header**: "Profile" title at top
- **Background**: Clean, minimal background (light theme)
- **Typography**: Clear hierarchy with field labels and content
- **Colors**: Consistent with app branding

### 📝 Content Sections

#### Header Section
- **Headline**: "Profile"
- **Purpose**: Clear identification of screen function

#### Profile Information Section
1. **Full Name Field**
   - Label: "Full name" (above field)
   - Display: User's full name from signup
   - Styling: Read-only field appearance
   - Data source: Supabase user metadata

2. **Email Field**
   - Label: "Email" (above field)
   - Display: User's email address
   - Styling: Read-only field appearance
   - Data source: Supabase auth user email

3. **Phone Number Field**
   - Label: "Phone number" (above field)
   - Display: User's phone number from signup
   - Styling: Read-only field appearance
   - Data source: Supabase user metadata

#### Action Section
1. **Sign Out Button**
   - Secondary button style (not primary to prevent accidental taps)
   - Full width
   - Text: "Sign Out"
   - Action: Logs user out and returns to welcome screen

## User Flow

```
Login/Signup Success
    ↓
┌─────────────┐
│  Profile    │
│  Screen     │
│             │
└─────┬───────┘
      │
      └── Sign Out ─────────→ Welcome Screen
```

## Implementation Considerations

### 🔧 Technical Requirements
- **Data Loading**: Fetch user profile data from Supabase
- **State Management**: Manage user session and profile state
- **Navigation**: Handle sign out and return to welcome flow
- **Error Handling**: Handle cases where profile data is missing

### 📱 Accessibility Features
- **Screen reader support**: Proper labels for all profile fields
- **Focus management**: Logical tab order through content
- **Touch targets**: 44pt minimum button sizes
- **Content reading**: Clear field labels and values

### 🎯 User Experience
- **Data display**: Clear, readable format for all information
- **Read-only state**: Visual indication that fields are not editable
- **Confirmation**: Optional confirmation dialog for sign out
- **Loading states**: Handle data loading gracefully

## Component Structure

### Profile Screen Components
- **ProfileHeader**: "Profile" title
- **ProfileInfo**: Container for all profile fields
- **ProfileField**: Reusable component for name, email, phone display
- **SignOutButton**: Action button for logging out

### Integration Points
- **Authentication**: Supabase auth user management
- **Data**: User profile metadata from Supabase
- **Navigation**: React Navigation for screen transitions
- **State**: User session management

## Data Management

### Profile Data Sources
1. **User Email**: From Supabase auth.user.email
2. **Full Name**: From Supabase user metadata or profiles table
3. **Phone Number**: From Supabase user metadata or profiles table

### Data Loading States
- **Loading**: Show skeleton or loading indicators
- **Loaded**: Display all profile information
- **Error**: Handle missing or corrupted data gracefully

## Sign Out Functionality

### Sign Out Process
1. **User taps Sign Out**: Initiate logout process
2. **Optional Confirmation**: "Are you sure you want to sign out?"
3. **Supabase Logout**: Clear session from Supabase
4. **State Cleanup**: Clear user data from app state
5. **Navigation**: Return to Welcome screen

### Sign Out States
- **Normal**: Standard "Sign Out" button
- **Loading**: "Signing out..." with loading indicator
- **Error**: Handle sign out failures gracefully

## Error Handling

### Common Error Scenarios
1. **Missing profile data**: "Unable to load profile information"
2. **Network errors**: "Unable to load profile. Please try again"
3. **Sign out failures**: "Unable to sign out. Please try again"
4. **Session expired**: Automatic redirect to welcome screen

### Error Display
- **Toast messages**: For temporary errors
- **Fallback content**: Show partial data when possible
- **Retry options**: Allow user to refresh profile data

## Future Enhancements

### Potential Additions
1. **Edit Profile**: Allow users to update their information
2. **Profile Photo**: Add avatar/profile picture functionality
3. **App Settings**: Theme, notifications, preferences
4. **Account Management**: Delete account, change password
5. **Tennis Stats**: Sport-specific profile information

### Recommended: Inline Editing (Better UX)
**Instead of separate edit mode, implement inline editing:**
- **Tap to edit**: Tap any field to make it editable in place
- **Auto-save**: Save changes automatically on blur/enter
- **Inline validation**: Show validation errors directly below field
- **Loading states**: Show saving indicator per field
- **Undo option**: Brief "Undo" toast after auto-save
- **No mode switching**: Eliminates need for edit/view modes

### Traditional Edit Mode (Alternative)
- **Edit Button**: Toggle between view and edit modes
- **Form Validation**: Validate changes before saving
- **Save/Cancel**: Clear actions for editing flow
- **Optimistic Updates**: Update UI before server confirmation

## Animation Opportunities
- **Screen transition**: Smooth entry from login/signup
- **Data loading**: Skeleton animations for profile fields
- **Button interactions**: Tactile feedback on sign out
- **Success feedback**: Confirmation of successful sign out

## Platform Considerations
- **iOS**: Follow iOS design patterns for profile screens
- **Android**: Material Design profile layouts
- **Web**: Responsive design for different screen sizes
- **Accessibility**: Full screen reader and keyboard support