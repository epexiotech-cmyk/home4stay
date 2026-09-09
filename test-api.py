import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def login():
    req = urllib.request.Request(
        'http://localhost:3000/api/auth/login',
        data=json.dumps({"email":"harsh.rural@gmail.com","password":"TestPassword123!"}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req, context=ctx) as response:
        cookies = response.headers.get_all('Set-Cookie')
        token = ""
        for c in cookies:
            if "access-token=" in c:
                token = c.split("access-token=")[1].split(";")[0]
        return token

def get_experiences(token, propertyId):
    req = urllib.request.Request(
        f'http://localhost:3000/api/property/experiences?propertyId={propertyId}',
        headers={'Cookie': f'access-token={token}'}
    )
    try:
        with urllib.request.urlopen(req, context=ctx) as r:
            return r.status, json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))

def post_experience(token, data):
    req = urllib.request.Request(
        'http://localhost:3000/api/property/experiences',
        data=json.dumps(data).encode('utf-8'),
        headers={'Cookie': f'access-token={token}', 'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req, context=ctx) as r:
            return r.status, json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))

def get_public_experiences(propertyId):
    req = urllib.request.Request(
        f'http://localhost:3000/api/properties/public/{propertyId}/experiences'
    )
    try:
        with urllib.request.urlopen(req, context=ctx) as r:
            return r.status, json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))

try:
    token = login()
    propId = "275d806a-f76f-4f2b-8cda-b7a25af83d23"
    print("[1] Logged in successfully.")
    
    status, res = get_experiences(token, propId)
    print(f"[2] Initial GET: {status}, len={len(res.get('data', []))}")
    
    lib_data = {
        "propertyId": propId,
        "title": "Royal Arrival Ritual",
        "slug": "royal-arrival-ritual",
        "category": "WELCOME",
        "description": "A traditional welcome...",
        "price": 0,
        "complimentary": True,
        "duration": "30 mins",
        "isActive": True,
        "isLibrary": True
    }
    status, res = post_experience(token, lib_data)
    print(f"[3] POST Library: {status}, success={res.get('success')}")
    
    custom_data = {
        "propertyId": propId,
        "title": "My Custom Experience",
        "slug": "my-custom-experience",
        "category": "ACTIVITIES",
        "description": "Custom fun...",
        "price": 500,
        "complimentary": False,
        "duration": "60 mins",
        "isActive": False,
        "isLibrary": False
    }
    status, res = post_experience(token, custom_data)
    print(f"[4] POST Custom: {status}, success={res.get('success')}")
    
    status, res = get_experiences(token, propId)
    print(f"[5] Subsequent GET: {status}, len={len(res.get('data', []))}")
    
    status, res = get_experiences(token, "00000000-0000-0000-0000-000000000000")
    print(f"[6] Tenant Isolation GET: {status}")
    
    status, res = get_public_experiences(propId)
    print(f"[7] Public GET: {status}, len={len(res.get('data', []))}")
    if status == 200:
        for ex in res.get('data', []):
            print(f"    Public returned: {ex['title']} (isActive: {ex['isActive']})")
except Exception as e:
    print("Test Failed:", e)
