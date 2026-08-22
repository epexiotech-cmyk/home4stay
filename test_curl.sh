curl -s -v -X POST http://localhost:3000/api/auth/partner/register \
-H "Content-Type: application/json" \
-d '{"name":"Test","email":"test10@test.com","password":"Password123!","phone":"9999999999","propertyName":"Test","acceptedTermsVersion":"1.0","acceptedPrivacyVersion":"1.0"}'
