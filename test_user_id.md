# Home4Stay Test Accounts

The following test accounts have been created for development and QA purposes. All accounts use the same default password.

**Default Password:** `Home@4971`

| Role | Email | Purpose |
| :--- | :--- | :--- |
| **Super Admin** | `super_admin@home4stay.com` | Full system access, platform configuration, and cross-portal management. |
| **Admin** | `admin@home4stay.com` | Property approvals, user management, and operational oversight. |
| **Manager** | `manager@home4stay.com` | Managing multiple properties for an owner or agency. |
| **Owner** | `owner@home4stay.com` | Listing properties, managing inventory, and viewing bookings. |
| **Customer** | `customer@home4stay.com` | Browsing properties, making bookings, and managing personal profile. |

## Login Portals

- **Customer Login:** [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
- **Partner Login:** [http://localhost:3000/partner/login](http://localhost:3000/partner/login) (For Owners and Managers)
- **Admin Login:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login) (For Admins and Super Admins)

> [!IMPORTANT]
> The authentication system enforces Role-Based Access Control (RBAC). Ensure you use the correct login portal for the role you are testing.
