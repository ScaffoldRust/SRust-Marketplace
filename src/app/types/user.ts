export interface UserProfile {
  id: string
  user_type: 'buyer' | 'seller' | 'both'
  display_name: string | null
  created_at: string
  updated_at: string
}

export interface StoreData {
  name: string
  description?: string
  stellar_wallet_address: string
  logo?: File
}

export interface Store {
  id: string
  owner_id: string
  name: string
  description: string | null
  logo_url: string | null
  stellar_wallet_address: string
  created_at: string
  updated_at: string
}
