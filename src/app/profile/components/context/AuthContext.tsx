'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { UserProfile, StoreData, Store } from '@/app/types/user'
import { uploadStoreLogo } from '@/lib/supabase/storage'

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, displayName: string, userType: 'buyer' | 'seller' | 'both') => Promise<void>
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  setUserType: (type: 'buyer' | 'seller' | 'both') => Promise<void>
  createStore: (storeData: StoreData) => Promise<Store>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const validateStellarAddress = (address: string): boolean => {
    const stellarRegex = /^G[A-Z0-9]{55}$/
    return stellarRegex.test(address)
  }

  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Profile fetch error:', error)
      return null
    }
  }

  const createProfile = async (
    userId: string, 
    displayName: string, 
    userType: 'buyer' | 'seller' | 'both'
  ): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          display_name: displayName,
          user_type: userType,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Profile creation error:', error)
      throw error
    }
  }

  const signUp = async (
    email: string, 
    password: string, 
    displayName: string, 
    userType: 'buyer' | 'seller' | 'both'
  ): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            user_type: userType,
          }
        }
      })

      if (error) throw error

      if (data.user) {
        await createProfile(data.user.id, displayName, userType)
      }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string, rememberMe = false): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Set session persistence based on rememberMe
      if (rememberMe) {
        await supabase.auth.updateUser({
          data: { remember_me: true }
        })
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setSession(null)
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const resetPassword = async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error
    } catch (error) {
      console.error('Password reset error:', error)
      throw error
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) throw new Error('No authenticated user')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      await refreshProfile()
    } catch (error) {
      console.error('Profile update error:', error)
      throw error
    }
  }

  const setUserType = async (type: 'buyer' | 'seller' | 'both'): Promise<void> => {
    await updateProfile({ user_type: type })
  }

  const createStore = async (storeData: StoreData): Promise<Store> => {
    if (!user) throw new Error('No authenticated user')
    if (!profile) throw new Error('No user profile found')

    if (!validateStellarAddress(storeData.stellar_wallet_address)) {
      throw new Error('Invalid Stellar wallet address format')
    }

    if (profile.user_type === 'buyer') {
      throw new Error('Only sellers can create stores')
    }

    try {
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert({
          owner_id: user.id,
          name: storeData.name,
          description: storeData.description || null,
          stellar_wallet_address: storeData.stellar_wallet_address,
        })
        .select()
        .single()

      if (storeError) throw storeError

      // Upload logo if provided
      let logoUrl = null
      if (storeData.logo) {
        logoUrl = await uploadStoreLogo(storeData.logo, store.id)
        
        if (logoUrl) {
          // Update store with logo URL
          const { error: updateError } = await supabase
            .from('stores')
            .update({ logo_url: logoUrl })
            .eq('id', store.id)

          if (updateError) {
            console.error('Error updating store logo:', updateError)
          } else {
            store.logo_url = logoUrl
          }
        }
      }

      return store
    } catch (error) {
      console.error('Store creation error:', error)
      throw error
    }
  }

  const refreshProfile = async (): Promise<void> => {
    if (user) {
      const userProfile = await fetchProfile(user.id)
      setProfile(userProfile)
    }
  }

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          return
        }

        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user) {
            const userProfile = await fetchProfile(session.user.id)
            setProfile(userProfile)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id)
          setProfile(userProfile)
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextType = {
    session,
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    setUserType,
    createStore,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
