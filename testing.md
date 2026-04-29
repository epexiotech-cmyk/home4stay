# Website Testing Routes (Hardened Auth)

## Base URL
http://localhost:3000

## Coverage Summary
- **Total Routes Discoveried**: 18
- **Success (200 OK)**: 9
- **Errors/Missing**: 9

## Route Status (CSRF + Rate Limited)

| Route | Status | Notes |
|-------|--------|-------|
| / | ✅ 200 | Working |
| /admin/leads | ✅ 200 | Role: Admin |
| /admin/login | ✅ 200 | Role: Admin |
| /admin/properties | ✅ 200 | Role: Admin |
| /admin/properties/royalvilla/images | ❌ Error | Request failed with status code 500 |
| /admin/properties/royalvilla/rooms | ❌ 404 | Not Found |
| /admin/properties/shivay/images | ❌ Error | Request failed with status code 500 |
| /admin/properties/shivay/rooms | ❌ 404 | Not Found |
| /demo-property | ❌ 404 | Not Found |
| /explore | ✅ 200 | Working |
| /partner | ✅ 200 | Working |
| /partner/contact | ✅ 200 | Working |
| /partner/demo | ✅ 200 | Working |
| /partner/pricing | ✅ 200 | Working |
| /privacy | ❌ 404 | Not Found |
| /royalvilla | ❌ 404 | Not Found |
| /shivay | ❌ 404 | Not Found |
| /terms | ❌ 404 | Not Found |

## Full URLs List

- http://localhost:3000/
- http://localhost:3000/admin/leads
- http://localhost:3000/admin/login
- http://localhost:3000/admin/properties
- http://localhost:3000/admin/properties/royalvilla/images
- http://localhost:3000/admin/properties/royalvilla/rooms
- http://localhost:3000/admin/properties/shivay/images
- http://localhost:3000/admin/properties/shivay/rooms
- http://localhost:3000/demo-property
- http://localhost:3000/explore
- http://localhost:3000/partner
- http://localhost:3000/partner/contact
- http://localhost:3000/partner/demo
- http://localhost:3000/partner/pricing
- http://localhost:3000/privacy
- http://localhost:3000/royalvilla
- http://localhost:3000/shivay
- http://localhost:3000/terms
