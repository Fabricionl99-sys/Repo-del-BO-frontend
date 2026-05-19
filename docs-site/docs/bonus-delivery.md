---
sidebar_position: 6
---

# Bonus delivery callback

Social2Game hace `POST` a tu URL cuando un jugador gana un bono de operador.

Headers: `X-S2G-Signature`, `X-S2G-Event`, `X-S2G-Delivery-Id`.

Respondé `200` al encolar la entrega en tu iGaming. Verificá HMAC con el secret del BO → Webhooks.
