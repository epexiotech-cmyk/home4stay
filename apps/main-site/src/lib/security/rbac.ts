/**
 * Role-Based Access Control (RBAC)
 */

export type Role = 'admin' | 'staff' | 'partner' | 'user'

export interface UserContext {
  id: string
  role: Role
  username: string
}

/**
 * Authorizes a user based on their role.
 * Throws an AppError if unauthorized.
 */
import { AppError } from "../errors/handler"

export function authorize(user: UserContext | undefined, allowedRoles: Role[]) {
  if (!user) {
    throw new AppError("Authentication required", 401, "UNAUTHORIZED")
  }

  if (!allowedRoles.includes(user.role)) {
    throw new AppError("Insufficient permissions", 403, "FORBIDDEN")
  }

  return user
}
