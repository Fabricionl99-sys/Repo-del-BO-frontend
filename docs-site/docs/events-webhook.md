---
sidebar_position: 5
---

# Events

Tu backend envía eventos a Social2Game (no es webhook entrante).

```bash
curl -X POST 'https://api.social2game.com/v1/events' \
  -H 'Authorization: Bearer wgpk_test_KEY' \
  -d '{"event_type":"bet","player_id":"pl_1","metadata":{"amount":25}}'
```

Batch: `POST /v1/events/batch` (hasta 100 eventos).
