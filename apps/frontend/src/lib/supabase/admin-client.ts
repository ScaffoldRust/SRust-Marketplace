import { adminClient, type SupabaseAdmin } from './client'

export type UserRole = 'admin' | 'seller' | 'user'

export interface AdminOperationResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

interface AdminConfig {
  enableLogging: boolean
  throwOnError: boolean
}

const defaultConfig: AdminConfig = {
  enableLogging: process.env.NODE_ENV === 'development',
  throwOnError: true,
}

/**
 * Logs admin operations for audit purposes
 */
function logAdminOperation(operation: string, details?: Record<string, any>): void {
  if (defaultConfig.enableLogging) {
    console.log(`[ADMIN OPERATION] ${operation}`, details)
  }
}

function handleAdminError(operation: string, error: any): never {
  const errorMessage = `Admin operation failed: ${operation} - ${error.message || error}`
  logAdminOperation(`ERROR: ${operation}`, { error: errorMessage })
  
  throw new Error(errorMessage)
}

export async function withAdminClient<T>(
  callback: (client: SupabaseAdmin) => Promise<T>,
  operationName: string = 'unknown_operation'
): Promise<T> {
  try {
    logAdminOperation(`Starting: ${operationName}`)
    const result = await callback(adminClient)
    logAdminOperation(`Completed: ${operationName}`)
    return result
  } catch (error) {
    handleAdminError(operationName, error)
  }
}

export class AdminUserService {
    
  static async resetPassword(userId: string, newPassword: string): Promise<AdminOperationResult> {
    if (!userId || !newPassword) {
      throw new Error('User ID and new password are required')
    }

    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long')
    }

    return withAdminClient(async (client) => {
      const { error } = await client.auth.admin.updateUserById(userId, {
        password: newPassword,
      })

      if (error) {
        throw new Error(`Failed to reset password: ${error.message}`)
      }

      logAdminOperation('Password reset', { userId })
      return { success: true }
    }, 'reset_user_password')
  }

  static async deleteUserComplete(userId: string): Promise<AdminOperationResult> {
    if (!userId) {
      throw new Error('User ID is required')
    }

    return withAdminClient(async (client) => {
      const { error: dbError } = await client.rpc('delete_user_data', {
        user_id_param: userId,
      })

      if (dbError) {
        throw new Error(`Failed to delete user data: ${dbError.message}`)
      }

      const { error: authError } = await client.auth.admin.deleteUser(userId)

      if (authError) {
        throw new Error(`Failed to delete user auth: ${authError.message}`)
      }

      logAdminOperation('User deleted completely', { userId })
      return { success: true }
    }, 'delete_user_complete')
  }

  static async assignRole(userId: string, role: UserRole): Promise<AdminOperationResult> {
    if (!userId || !role) {
      throw new Error('User ID and role are required')
    }

    const validRoles: UserRole[] = ['admin', 'seller', 'user']
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`)
    }

    return withAdminClient(async (client) => {
      // Check if user already has this role
      const { data: existingRole, error: checkError } = await client
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', role)
        .maybeSingle()

      if (checkError) {
        throw new Error(`Failed to check existing role: ${checkError.message}`)
      }

      if (existingRole) {
        logAdminOperation('Role already assigned', { userId, role })
        return { success: true, data: existingRole }
      }

      // Assign the new role
      const { data, error } = await client
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to assign role: ${error.message}`)
      }

      logAdminOperation('Role assigned', { userId, role })
      return { success: true, data }
    }, 'assign_user_role')
  }

  static async removeRole(userId: string, role: UserRole): Promise<AdminOperationResult> {
    if (!userId || !role) {
      throw new Error('User ID and role are required')
    }

    return withAdminClient(async (client) => {
      const { error } = await client
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role)

      if (error) {
        throw new Error(`Failed to remove role: ${error.message}`)
      }

      logAdminOperation('Role removed', { userId, role })
      return { success: true }
    }, 'remove_user_role')
  }

  static async getUserRoles(userId: string): Promise<AdminOperationResult<UserRole[]>> {
    if (!userId) {
      throw new Error('User ID is required')
    }

    return withAdminClient(async (client) => {
      const { data, error } = await client
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)

      if (error) {
        throw new Error(`Failed to fetch user roles: ${error.message}`)
      }

      const roles = data?.map(item => item.role as UserRole) || []
      return { success: true, data: roles }
    }, 'get_user_roles')
  }
}

export { adminClient as superAdmin }

export const resetUserPassword = AdminUserService.resetPassword
export const deleteUserComplete = AdminUserService.deleteUserComplete
export const assignUserRole = AdminUserService.assignRole
export const removeUserRole = AdminUserService.removeRole