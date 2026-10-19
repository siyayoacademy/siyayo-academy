# V28-compatible simulated local test credential; NEVER use for real authentication.
import base64, hashlib, hmac, json, pathlib, time
p=pathlib.Path(__file__).with_name('.dev.vars')
secret=dict(line.split('=',1) for line in p.read_text().splitlines() if '=' in line)['V29_SIM_SECRET'].strip().strip('"').encode()
assert len(secret)>=24
claims={'sub':'lab-learner-a','scope':'WHICH/EN/S1','exp':int(time.time())+600,'kind':'v28-lab'}
b64=lambda b:base64.urlsafe_b64encode(b).decode().rstrip('=')
body=b64(json.dumps(claims,sort_keys=True,separators=(',',':')).encode())
print(body+'.'+b64(hmac.new(secret,body.encode(),hashlib.sha256).digest()))
