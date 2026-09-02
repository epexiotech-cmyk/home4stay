#!/bin/bash
curl -s -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"super_admin@home4stay.com","password":"Admin123!"}' -c cookies.txt > /dev/null
curl -s -b cookies.txt http://localhost:3000/api/admin/database
