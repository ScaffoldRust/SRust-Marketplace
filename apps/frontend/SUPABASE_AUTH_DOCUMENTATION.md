# Supabase Authentication Integration Documentation

## Overview

This document outlines the complete Supabase Authentication Integration implemented in the SR Template Marketplace project. The integration includes user registration, login, profile management, Row Level Security (RLS) policies, and file storage configuration.

## Architecture

### Authentication Flow

```mermaid
graph TD
    A[User Visits Site] --> B{Authenticated?}
    B -->|No| C[Show Auth Modal]
    B -->|Yes| D[Show Dashboard]
    
    C --> E[Profile Selection]
    E --> F{User Type}
    F -->|Buyer| G[Registration Form]
    F -->|Seller| G[Registration Form]
    
    G --> H[Create Account]
    H --> I[Auto Profile Creation]
    I --> J{Seller?}
    J -->|Yes| K[Store Setup]
    J -->|No| L[Complete Onboarding]
    K --> L
    
    C --> M[Login Form]
    M --> N[Authenticate]
    N --> D
```

## Environment Configuration

### Required Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database Configuration
SUPABASE_POSTGRES_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Storage Configuration
NEXT_PUBLIC_SUPABASE_STORAGE_URL=http://127.0.0.1:54321/storage/v1
S3_ACCESS_KEY=your_s3_access_key
S3_SECRET_KEY=your_s3_secret_key
S3_REGION=local

# JWT Configuration
SUPABASE_JWT_SECRET=your_jwt_secret_32_chars_minimum

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## File Storage Configuration

### Storage Buckets

#### product-images
- **Purpose**: Store product images
- **Access**: Public read, authenticated write
- **Allowed Types**: image/jpeg, image/png, image/gif
- **Max Size**: 5MB per file

#### store-logos
- **Purpose**: Store seller logos
- **Access**: Public read, authenticated write
- **Allowed Types**: image/jpeg, image/png, image/gif
- **Max Size**: 2MB per file

### Storage Policies

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

-- Allow public access to view images
CREATE POLICY "Public can view images" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'product-images');
```

## API Integration

### Authentication Endpoints

#### `/api/auth/callback`
- **Purpose**: Handle OAuth callbacks and email confirmations
- **Method**: GET
- **Response**: Redirects to appropriate page

#### `/api/auth/reset-password`
- **Purpose**: Send password reset emails
- **Method**: POST
- **Body**: `{ email: string }`

### Client-Side Integration

```typescript
// Login
const { data, error } = await signIn(email, password);

// Register
const { data, error } = await signUp(email, password, metadata);

// Logout
await signOut();

// Password Reset
await resetPassword(email);
```

## Testing

### Integration Tests

Run the comprehensive test suite:

```bash
node test-auth.js
```

### Test Coverage

1. **Environment Configuration**
   - Supabase connection
   - Environment variables validation
   - Service availability

2. **Database Schema**
   - Table existence and accessibility
   - RLS policies verification
   - Indexes and constraints

3. **Authentication Flow**
   - User registration
   - User login/logout
   - Profile creation
   - Session management

4. **File Storage**
   - Bucket configuration
   - Upload/download functionality
   - Access permissions

5. **Security Configuration**
   - RLS enforcement
   - JWT configuration
   - Input validation


### Alerting

Set up alerts for:
- High error rates (>5%)
- Slow response times (>2s)
- Multiple failed login attempts
- Unusual traffic patterns

## Conclusion

The Supabase Authentication Integration provides a robust, secure, and scalable authentication system for the SR Template Marketplace. With proper RLS policies, comprehensive testing, and thorough documentation, the system is ready for production deployment.

For additional support or questions, refer to the [Supabase Documentation](https://supabase.com/docs) or contact the development team.