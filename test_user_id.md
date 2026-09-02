# Home4Stay Test Accounts

The following test accounts have been created for development and QA purposes. All accounts use the same default password.

**Default Password:** `Home@4971`

| Role | Email | Owner ID / Purpose | Property ID |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `super_admin@home4stay.com` | Full system access | - |
| **Admin** | `admin@home4stay.homes` | Property approvals | - |
| **Manager** | `manager@home4stay.com` | Multiple properties | - |
| **Owner - Shivay Resort** | `owner@shivay.com` | `owner_shivay` | `shivay-resort-101` |
| **Owner - Royal Villa** | `owner@royalvilla.com` | `owner_royalvilla` | `royal-villa-202` |
| **Owner - Taj Villa** | `owner@tajvilla.com` | `owner_tajvilla` | `taj-villa-303` |
| **Owner - Ocean View Resort** | `owner@oceanview.com` | `owner_oceanview` | `ocean-view-404` |
| **Customer** | `customer@home4stay.com` | Personal profile | - |

## Login Portals

- **Customer Login:** [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
- **Partner Login:** [http://localhost:3000/partner/login](http://localhost:3000/partner/login) (For Owners and Managers)
- **Admin Login:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login) (For Admins and Super Admins)

> [!IMPORTANT]
> The authentication system enforces Role-Based Access Control (RBAC). Ensure you use the correct login portal for the role you are testing.
