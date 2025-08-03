# Supabase Authentication Integration Documentation

## Overview

This document provides comprehensive information about the Supabase Authentication Integration implemented in the marketplace template. The authentication system includes user registration, login, profile management, role-based access control, and secure file storage.

## Table of Contents

1. [Authentication Setup](#authentication-setup)
2. [Environment Configuration](#environment-configuration)
3. [Database Schema](#database-schema)
4. [Authentication Flows](#authentication-flows)
5. [Row Level Security (RLS)](#row-level-security-rls)
6. [File Storage](#file-storage)
7. [API Integration](#api-integration)
8. [Testing](#testing)
9. [Security Considerations](#security-considerations)
10. [Troubleshooting](#troubleshooting)

## Authentication Setup

### Supabase Configuration

The authentication system is built on Supabase and includes:

- **User Management**: Registration, login, logout, password reset
- **Profile System**: Automatic profile creation with user types (buyer, seller, both)
- **Role-Based Access**: Admin roles and permissions
- **Session Management**: Persistent sessions with auto-refresh
- **File Storage**: Secure image uploads for products and stores

### Key Components

1. **Authentication Hook** (`src/hooks/useAuth.ts`)
   - Manages authentication state
   - Provides login, logout, registration functions
   - Handles session persistence

2. **Supabase Client** (`src/lib/supabase/client.ts`)
   - Configured for both anonymous and admin access
   - Handles authentication persistence
   - Manages auto-refresh tokens

3. **Middleware** (`src/middleware.ts`)
   - Protects authenticated routes
   - Manages session updates
   - Handles redirects

## Environment Configuration

### Required Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: Production URLs
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
```

### Local Development Setup

1. **Start Supabase locally**:
   ```bash
   supabase start
   ```

2. **Get local credentials**:
   ```bash
   supabase status
   ```

3. **Apply database migrations**:
   ```bash
   psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f src/lib/db/migrations/migration.sql
   ```

## Database Schema

### Core Tables

#### 1. Profiles Table
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_type TEXT CHECK (user_type in ('buyer', 'seller', 'both')) NOT NULL,
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. User Roles Table
```sql
CREATE TABLE user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    PRIMARY KEY (user_id, role)
);
```

#### 3. Products Table
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL CHECK (price > 0),
    category UUID REFERENCES categories(id),
    seller_id UUID REFERENCES auth.users(id),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    slug TEXT UNIQUE NOT NULL,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Automatic Profile Creation

A database trigger automatically creates a profile when a new user registers:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, display_name, user_type)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', 
                NEW.raw_user_meta_data->>'full_name', 
                split_part(NEW.email, '@', 1)),
        'buyer'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Authentication Flows

### 1. User Registration

```typescript
const { signUp } = useAuth();

const handleRegistration = async () => {
  try {
    await signUp(email, password, {
      display_name: displayName,
      user_type: userType
    });
    // Profile is automatically created via database trigger
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

### 2. User Login

```typescript
const { signIn } = useAuth();

const handleLogin = async () => {
  try {
    await signIn(email, password);
    // Session is automatically managed
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### 3. Password Reset

```typescript
const { resetPassword } = useAuth();

const handlePasswordReset = async () => {
  try {
    await resetPassword(email);
    // Reset email sent to user
  } catch (error) {
    console.error('Password reset failed:', error);
  }
};
```

### 4. Session Management

```typescript
const { user, session, loading } = useAuth();

// Check if user is authenticated
if (loading) return <LoadingSpinner />;
if (!user) return <LoginForm />;

// User is authenticated
return <AuthenticatedContent />;
```

## Row Level Security (RLS)

### Admin Policies

```sql
-- Admin function for role checking
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN false;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Categories require admin access for modifications
CREATE POLICY "Only admins can insert categories" 
ON categories FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Only admins can update categories" 
ON categories FOR UPDATE USING (is_admin());

CREATE POLICY "Only admins can delete categories" 
ON categories FOR DELETE USING (is_admin());
```

## File Storage

### Storage Buckets

Two main storage buckets are configured:

1. **product-images**: For product photos and images
2. **store-assets**: For store logos and banners

### Storage Configuration

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('product-images', 'product-images', true, 5242880, 
     '{"image/png","image/jpeg","image/gif","image/webp"}'),
    ('store-assets', 'store-assets', true, 5242880, 
     '{"image/png","image/jpeg","image/gif","image/webp"}');
```

### File Upload Example

```typescript
import { supabase } from '@/lib/supabase/client';

const uploadProductImage = async (file: File, productId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${productId}-${Date.now()}.${fileExt}`;
  const filePath = `products/${fileName}`;
  
  const { error, data } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });
    
  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);
    
  return publicUrl;
};
```

## API Integration

### Protected Routes

Routes that require authentication are protected by middleware:

```typescript
// middleware.ts
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/store/manage/:path*',
    '/profile/:path*',
    '/settings/:path*',
  ],
};
```

### Server-Side Authentication

```typescript
import { createClient } from '@/utils/supabase/server';

export async function getServerSideProps(context) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  
  return {
    props: { user },
  };
}
```

### API Routes

```typescript
// app/api/protected/route.ts
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Protected API logic here
  return Response.json({ message: 'Success', user: user.id });
}
```

## Testing

### Running Authentication Tests

1. **Comprehensive Authentication Test**:
   ```bash
   node test-auth-comprehensive.js
   ```

3. **Full Test Suite**:
   ```bash
   npm run test:db
   ```

### Test Coverage

The authentication tests cover:

- ✅ Database connectivity
- ✅ User registration and login flows
- ✅ Session management
- ✅ Profile creation triggers
- ✅ Row Level Security policies
- ✅ File storage operations
- ✅ Database functions
- ✅ Admin role verification

## Security Considerations

### 1. Row Level Security (RLS)

- All tables have RLS enabled
- Policies ensure users can only access their own data
- Admin functions are properly secured
- Public access is limited to safe operations

### 2. Authentication Security

- Passwords are hashed using bcrypt
- Sessions use secure JWT tokens
- Auto-refresh prevents session expiry
- Service role key is kept server-side only

### 3. File Upload Security

- File type restrictions (images only)
- File size limits (5MB max)
- Public access for display purposes
- Upload requires authentication

### 4. API Security

- Protected routes require authentication
- Server-side user verification
- Proper error handling without information leakage
- CORS configuration for security

## Conclusion

The Supabase Authentication Integration provides a complete, secure, and scalable authentication system for the marketplace template. It includes:

- ✅ Complete user authentication flows
- ✅ Secure row-level security policies
- ✅ File storage with proper permissions
- ✅ Role-based access control
- ✅ Comprehensive test coverage

The system is ready for production use and can be easily extended with additional features as needed.