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

try:
    token = login()
    propId = "275d806a-f76f-4f2b-8cda-b7a25af83d23"
    lib_data = {
        "propertyId": propId,
        "title": "Ayur Wellness Ritual",
        "slug": "ayur-wellness-ritual",
        "category": "Wellness",
        "description": "Rejuvenating Ayurvedic massage and herbal steam bath.",
        "price": 3500,
        "complimentary": False,
        "duration": "90 Mins",
        "isActive": True,
        "isLibrary": True,
        "icon": "heart"
    }
    status, res = post_experience(token, lib_data)
    print(f"POST Library: {status}, success={res.get('success')}")
except Exception as e:
    print("Test Failed:", e)
