import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(
    'http://localhost:3000/api/auth/login',
    data=json.dumps({"email":"admin@home4stay.com","password":"password"}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        cookies = response.headers.get_all('Set-Cookie')
        token = ""
        for c in cookies:
            if "access-token=" in c:
                token = c.split("access-token=")[1].split(";")[0]
        
        print("Logged in, token:", token[:10] + "...")
        
        req2 = urllib.request.Request(
            'http://localhost:3000/api/property/experiences?propertyId=test',
            headers={'Cookie': f'access-token={token}'}
        )
        try:
            with urllib.request.urlopen(req2, context=ctx) as r2:
                print("GET Status:", r2.status)
                print(r2.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            print("GET Failed:", e.code)
            print(e.read().decode('utf-8'))
            
except Exception as e:
    print("Login Failed:", e)
