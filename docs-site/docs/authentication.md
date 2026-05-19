---
sidebar_position: 3
---

# Authentication

## API keys

```
Authorization: Bearer wgpk_test_xxxxxxxx
X-Operator-Id: op_your_operator_id
```

| Scope | Descripción |
|-------|-------------|
| `events:write` | Enviar eventos |
| `players:read` | Consultar jugadores |
| `bonuses:write` | CRUD bonos |

## JWT (Back Office)

Rutas `/admin/*` usan JWT de sesión tras login en el BO.
