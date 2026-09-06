<h1 align="center">Event Booking API</h1>

<p align="center">
  A production-shaped REST API for publishing events and booking seats on them —<br/>
  built with NestJS, MongoDB and JWT auth, with role-based access control and capacity enforcement.
</p>

<p align="center">
  <img alt="NestJS" src="https://img.shields.io/badge/NestJS-12-E0234E?logo=nestjs&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?logo=mongodb&logoColor=white" />
  <img alt="Node" src="https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white" />
  <img alt="JWT" src="https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white" />
  <img alt="ESM" src="https://img.shields.io/badge/Modules-ESM-F7DF1E?logo=javascript&logoColor=black" />
</p>

---

## What it does

Three resources and one rule that ties them together.

An **admin** publishes an **Event** with an optional seat `capacity`. Any signed-up
**User** creates a **Booking** for a number of tickets. The API refuses any booking
that would push an event past its capacity, and releases those seats again when a
booking is cancelled.

Everything else follows from who is asking:

- Browsing events is **public**.
- Creating, editing and deleting events is **admin-only**.
- A user sees and edits **only their own bookings**; an admin sees all of them.
- A user reads and edits **only their own account**; an admin reads any.

---

## What this project demonstrates

Rather than a CRUD skeleton, this is built the way a real service is layered.

| | |
|---|---|
| **Modular architecture** | Feature modules (`user`, `event`, `booking`, `auth`) with a strict controller → service → schema split. Controllers are one line; all logic lives in services. |
| **Authentication & RBAC** | JWT issued on login, verified by a custom `AuthGuard`, with a metadata-driven `RolesGuard` + `@Roles('admin')` decorator built on `SetMetadata` and `Reflector`. |
| **Correct use of Nest primitives** | Guards for identity and permission, pipes for validation, services for business rules, exception filters for error shape — each concern in the layer that can actually see the data it needs. |
| **Security by default** | bcrypt password hashing, `select: false` on the password field, a global `ValidationPipe` with `forbidNonWhitelisted`, privilege fields kept out of every DTO, and per-IP rate limiting on login. |
| **Real domain logic** | Seat accounting across booking states, cross-field date validation, ownership checks, and uniqueness enforced by both a query and a unique index. |
| **Honest documentation** | This README plus [`PROJECT.md`](PROJECT.md) — architecture, request lifecycle, data model, and a frank list of what is *not* done. |

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | NestJS 12 — native **ESM** (`"type": "module"`, `moduleResolution: nodenext`) |
| Language | TypeScript 6, `strict` |
| Database | MongoDB via Mongoose 9, schemas defined with `@nestjs/mongoose` decorators |
| Auth | `@nestjs/jwt`, bcrypt, custom guards |
| Validation | class-validator + class-transformer through a global `ValidationPipe` |
| Config | `@nestjs/config` with `.env` |
| Tooling | oxlint, Vitest, Nest CLI |

---

## Quick start

**Requirements:** Node.js 20+ and a local MongoDB. (Nest's CLI tooling prefers
Node 22+ and will print engine warnings on 20 — the app itself runs fine.)

```bash
git clone https://github.com/islamashraf2003/event-booking-nestjs.git
cd event-booking-nestjs
npm install
```

Create a `.env` in the project root:

```ini
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=1d
```

Start it:

```bash
npm run start:dev      # http://localhost:3000
```

MongoDB is expected at `mongodb://localhost/event-booking-db`.

### Try it in 60 seconds

```bash
# 1. sign up (always created with role "user")
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada","email":"ada@example.com","password":"Str0ng!Pass9"}'

# 2. log in and keep the token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"Str0ng!Pass9"}' \
  | node -pe "JSON.parse(require('fs').readFileSync(0)).data.token")

# 3. browse events — no token needed
curl http://localhost:3000/events

# 4. book two seats — the owner is taken from the token, not the body
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"event":"<EVENT_ID>","tickets":2}'
```

Creating an event needs an admin. Signup can never grant that, so promote a user
directly in Mongo:

```js
db.users.updateOne({ email: 'ada@example.com' }, { $set: { role: 'admin' } })
```

Then log in again — a token is a snapshot from login time and won't upgrade itself.

---

## API

🔒 requires a Bearer token · 👑 requires the `admin` role · unmarked is public.

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | Returns `{ token, user }`. Rate limited to **5 attempts per minute per IP**. |

### Users

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/user` | Sign up. Password must pass `@IsStrongPassword`; it's hashed and never returned. |
| `GET` 👑 | `/user` | List all users. |
| `GET` 🔒 | `/user/:id` | Self or admin. |
| `PATCH` 🔒 | `/user/:id` | Self or admin. Re-hashes a new password; rejects an email already taken. |
| `DELETE` 🔒 | `/user/:id` | Self or admin. |

### Events

| Method | Endpoint | Description |
|---|---|---|
| `POST` 👑 | `/events` | Create. `title` and `startsAt` required; `endsAt` must be after `startsAt`. |
| `GET` | `/events` | Public catalogue, sorted by start date. |
| `GET` | `/events/:id` | Public. |
| `PATCH` 👑 | `/events/:id` | Partial update; the date range is re-validated against stored values. |
| `DELETE` 👑 | `/events/:id` | Hard delete. |

### Bookings

| Method | Endpoint | Description |
|---|---|---|
| `POST` 🔒 | `/bookings` | Book seats. Owner comes from the JWT — sending `user` is rejected. |
| `GET` 🔒 | `/bookings` | Your bookings; admins see all. `user` and `event` populated. |
| `GET` 🔒 | `/bookings/:id` | Owner or admin. |
| `PATCH` 🔒 | `/bookings/:id` | Owner or admin. Change `tickets` or `status`; capacity re-checked. |
| `DELETE` 🔒 | `/bookings/:id` | Owner or admin. |

### Response shape

Every success returns the same envelope:

```json
{ "message": "Booking created successfully", "data": { "...": "..." } }
```

Errors use Nest's standard shape, with the status code carrying the meaning:

| Code | Meaning |
|---|---|
| `400` | Validation failed, malformed id, empty PATCH body, or an unknown property in the body |
| `401` | Missing, malformed or expired token, or bad credentials |
| `403` | Authenticated, but not allowed — wrong role, or someone else's resource |
| `404` | No such user, event or booking |
| `409` | Email already in use, or not enough seats left |
| `429` | Too many login attempts |

---

## Architecture

A modular monolith: one process, self-contained feature modules, one shared database.

```
src/
├── main.ts                  bootstrap + global ValidationPipe
├── app.module.ts            config, Mongo connection, feature modules
├── core/
│   ├── schemas/             Mongoose schemas — shared vocabulary
│   ├── guards/              AuthGuard · RolesGuard · RateLimitGuard
│   └── decorators/          @Roles · @RateLimit · @CurrentUser
└── modules/
    ├── auth/                login + JWT issuing
    ├── user/                controller · service · module · dto
    ├── event/               ↑ same shape
    └── booking/             ↑ same shape
```

Every request runs the same pipeline, and **where a check lives is a deliberate choice**:

```
Request → Guard → Pipe → Controller → Service → Mongoose → MongoDB
           │       │        │            │
           │       │        │            └── business rules (capacity, ownership)
           │       │        └── routes only, one line per handler
           │       └── shape of the input (ValidationPipe)
           └── identity & permission (AuthGuard, RolesGuard, RateLimitGuard)
```

Guards run **before** pipes, so an unauthenticated request is rejected before the
body is even parsed. That ordering is precisely why authentication belongs in a
guard rather than a service.

📖 **[`PROJECT.md`](PROJECT.md)** goes deeper — module dependency graph, the full
data model, DI wiring, and a request traced end to end.

---

## Engineering notes

A few decisions and bugs worth reading, because they're where the real work was.

<details>
<summary><b>A Mongoose ref that silently became <code>Mixed</code></b></summary>

<br/>

The capacity check passed when it should have failed: a capacity-3 event happily
accepted 5 tickets. The query wasn't wrong — it matched **zero** documents.

The schema declared refs as `@Prop({ type: Types.ObjectId })` using Mongoose's
**BSON value class**. NestJS's `DefinitionsFactory.isMongooseSchemaType()` checks
whether a constructor's prototype is `mongoose.SchemaType`; the BSON `ObjectId`
fails that test, so NestJS treated it as a nested class, produced an empty
definition, and Mongoose fell back to **`Mixed`**. Refs were stored as plain
strings, so `find({ event: someObjectId })` never matched.

What made it hide so well: `populate()` still worked perfectly.

The fix is one word — `mongoose.Schema.Types.ObjectId`:

```ts
@Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', required: true })
event: Types.ObjectId;
```

Verified with `BookingSchema.path('event').instance`, which went from `Mixed` to `ObjectId`.

</details>

<details>
<summary><b>Why <code>Object.keys(dto).length</code> can't detect an empty PATCH body</b></summary>

<br/>

A `PATCH` with `{}` was returning **200** instead of **400**.

With `target: ES2023`, TypeScript enables `useDefineForClassFields`, so class
fields are *defined* rather than assigned. A DTO instance therefore carries every
declared property as an own key with the value `undefined` — `Object.keys()`
returns 3, never 0.

Each service now builds its update object explicitly and counts that instead:

```ts
const updates: Partial<Event> = {};
if (body.title !== undefined) updates.title = body.title;
// ...
if (Object.keys(updates).length === 0)
  throw new BadRequestException('No fields to update');
```

This also stopped `undefined` values from being spread into the update document.

</details>

<details>
<summary><b>Identity from the token, never from the body</b></summary>

<br/>

`POST /bookings` originally accepted `user` in the request body — which meant
anyone could book seats in someone else's name. `user` was removed from
`BookingDto` entirely; the owner now comes from the verified JWT:

```ts
const newBooking = await this.bookingModel.create({
  user: currentUser.sub,     // signed by us, not supplied by the client
  event: bookingBody.event,
  ...
});
```

The same principle keeps `role` out of every DTO. Combined with
`forbidNonWhitelisted: true`, sending either field is a **400** rather than a
silently ignored property — so privilege escalation fails loudly.

</details>

<details>
<summary><b>Roles are a guard; ownership is not</b></summary>

<br/>

"Are you an admin?" is answered from the token, so `RolesGuard` settles it before
the handler runs. "Is this *your* booking?" needs the document itself, so it lives
in the service (`assertOwnerOrAdmin`), where the entity is already loaded.

Splitting them avoids a guard that duplicates database access purely to answer a
question the service is about to answer anyway.

</details>

<details>
<summary><b>Rate limiting without a compatible library</b></summary>

<br/>

`@nestjs/throttler@6.5.0` declares peer support only through NestJS 11, and this
project runs 12. Rather than force an unsupported package in with
`--legacy-peer-deps`, login is protected by a small `RateLimitGuard` — an
in-memory counter keyed by route + IP, configured by a `@RateLimit(5, 60_000)`
decorator built on the same `SetMetadata` / `Reflector` pattern as `RolesGuard`.

Its limitation is stated plainly: the counter is per-process, so it resets on
restart and doesn't span replicas. Redis is the answer at that point.

</details>

---

## Verification

Every endpoint was exercised by hand with `curl` against a running server and a
live MongoDB — happy paths plus the failure modes: unauthenticated access,
cross-user access, role violations, capacity exhaustion, malformed ids, empty
updates, duplicate emails and rate-limit exhaustion. Password hashing was
confirmed by reading the stored value back out of Mongo and running
`bcrypt.compare` against it.

`npx tsc --noEmit` and `npx oxlint src/` both run clean.

**There is no automated test suite yet.** Vitest is configured and the harness is
in place, but the specs are not written — see the roadmap below. Manual
verification is not a substitute, and this README won't pretend otherwise.

---

## Roadmap

- [ ] Automated tests — unit tests for the services, e2e for the guard matrix
- [ ] Refresh tokens and logout (a leaked token currently can't be revoked)
- [ ] Admin-only `PATCH /user/:id/role` instead of promoting in the shell
- [ ] Atomic seat counter (`$inc` under a filter) to close the oversell race
- [ ] Cascade deletes so removing an event doesn't orphan its bookings
- [ ] Restrict the `confirmed` status transition to admins / a payment step
- [ ] CORS and `helmet` ahead of a browser frontend
- [ ] Mongo URI from the environment rather than hard-coded
- [ ] Swagger / OpenAPI via `@nestjs/swagger`
- [ ] Dockerfile + docker-compose for one-command startup

---

## Author

**Islam Ashraf** — [github.com/islamashraf2003](https://github.com/islamashraf2003)

Built as a study of production NestJS patterns: layered modules, guard-based
access control, and documentation thorough enough that someone else could pick
the project up.
