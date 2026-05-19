import os
import requests

base = os.environ.get("S2G_API_BASE", "https://api.social2game.com")
key = os.environ.get("S2G_API_KEY")
if not key:
    raise SystemExit("Set S2G_API_KEY")

resp = requests.post(
    f"{base}/v1/events",
    json={"event_type": "login", "player_id": "pl_demo_001"},
    headers={"Authorization": f"Bearer {key}"},
    timeout=30,
)
resp.raise_for_status()
print(resp.json())
