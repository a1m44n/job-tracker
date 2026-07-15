# Job Tracker — full build specification

**Purpose of this document:** hand this to an LLM (or read it yourself) to build a complete, self-hosted Job Tracker application. It covers backend, frontend, database, Docker packaging, and homelab server setup end to end. Every section is written to be specific enough to implement without guessing — file paths, exact commands, and full config file contents are included.

**Deployment context (read this first):**
- **Server:** an Ubuntu CLI-only machine (no desktop environment) used as a homelab box. This is where every container runs.
- **Client:** a separate Windows/gaming PC on the same home LAN. It only ever talks to the server over HTTP — no code runs on it.
- **Network scope:** LAN-only. Nothing is exposed to the public internet. This simplifies auth/CORS/TLS decisions throughout — those simplifications are called out explicitly where they matter, along with what would need to change for public exposure later.

---

## 1. What we're building

A job application tracker: track companies applied to, current status (Applied / Interview / Offer / Rejected), contacts at each company, and free-text notes per application. Single user account is enough, but proper JWT auth is implemented anyway since that's the point of the exercise.

**Component list:**

| Component | Role |
|---|---|
| Spring Boot API | Business logic, auth, REST endpoints |
| PostgreSQL | Persistent storage |
| React (Vite) frontend | UI, served as static files via Nginx |
| Docker Compose | Orchestrates all three as containers on the homelab server |

**Network diagram (LAN):**

```
[ Gaming PC ]  --http://<server-lan-ip>:3000-->  [ Nginx: React static files ]
     |                                                     |
     |----------http://<server-lan-ip>:8080/api----------> [ Spring Boot API ] --> [ PostgreSQL ]
                                                       (all containers on homelab server,
                                                        Docker network "jobtracker-net")
```

---

## 2. Tech stack and versions

| Layer | Choice | Version |
|---|---|---|
| Language | Java | 21 (LTS) |
| Framework | Spring Boot | 3.3.x |
| Persistence | Spring Data JPA + Hibernate | (bundled w/ Spring Boot) |
| Database | PostgreSQL | 16 |
| Auth | Spring Security + JJWT | jjwt 0.12.x |
| Docs | springdoc-openapi (Swagger UI) | 2.5.x |
| Build tool | Maven | 3.9.x |
| Frontend framework | React | 18 |
| Frontend build tool | Vite | 5.x |
| Frontend routing | React Router | 6.x |
| HTTP client | Axios | latest |
| Frontend server | Nginx | alpine |
| Container runtime | Docker Engine + Compose plugin | latest stable |
| Server OS | Ubuntu Server | 22.04 or 24.04 LTS |

Lombok is used in the backend to cut boilerplate (getters/setters/constructors).

---

## 3. Repository structure

Single monorepo, two top-level app folders plus compose files at the root:

```
job-tracker/
├── backend/
│   ├── src/main/java/aiman/dev/jobtracker/
│   │   ├── JobTrackerApplication.java
│   │   ├── config/
│   │   │   ├── SecurityConfig.java
│   │   │   ├── CorsConfig.java
│   │   │   └── OpenApiConfig.java
│   │   ├── security/
│   │   │   ├── JwtUtil.java
│   │   │   ├── JwtAuthFilter.java
│   │   │   └── UserDetailsServiceImpl.java
│   │   ├── model/
│   │   │   ├── User.java
│   │   │   ├── Job.java
│   │   │   ├── Contact.java
│   │   │   ├── Note.java
│   │   │   └── JobStatus.java        (enum)
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   ├── JobRepository.java
│   │   │   ├── ContactRepository.java
│   │   │   └── NoteRepository.java
│   │   ├── dto/
│   │   │   ├── auth/  (RegisterRequest, LoginRequest, AuthResponse)
│   │   │   ├── job/   (JobRequest, JobResponse, JobStatusUpdateRequest)
│   │   │   ├── contact/ (ContactRequest, ContactResponse)
│   │   │   └── note/  (NoteRequest, NoteResponse)
│   │   ├── service/
│   │   │   ├── AuthService.java
│   │   │   ├── JobService.java
│   │   │   ├── ContactService.java
│   │   │   └── NoteService.java
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── JobController.java
│   │   │   ├── ContactController.java
│   │   │   └── NoteController.java
│   │   └── exception/
│   │       ├── ResourceNotFoundException.java
│   │       ├── DuplicateResourceException.java
│   │       └── GlobalExceptionHandler.java
│   ├── src/main/resources/
│   │   └── application.yml
│   ├── Dockerfile
│   ├── .dockerignore
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosClient.js
│   │   │   ├── authApi.js
│   │   │   └── jobApi.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── JobCard.jsx
│   │   │   ├── JobForm.jsx
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   └── JobDetailPage.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .dockerignore
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── .env                  (real secrets — gitignored)
├── .env.example           (committed template)
└── README.md
```

---

## 4. Database schema

Let Hibernate generate the schema (`ddl-auto: update`) rather than hand-writing migrations — acceptable for a solo homelab project. Fields below define the entity design precisely.

**users**
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK, generated |
| username | varchar(50) | unique, not null |
| email | varchar(255) | unique, not null |
| password | varchar(255) | BCrypt hash, not null |
| created_at | timestamp | default now() |

**jobs**
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| company | varchar(150) | not null |
| role | varchar(150) | not null |
| status | varchar(20) | enum: APPLIED, INTERVIEW, OFFER, REJECTED, WITHDRAWN |
| job_url | varchar(500) | nullable |
| location | varchar(150) | nullable |
| salary | varchar(100) | nullable, free text (e.g. "RM6,000/mo") |
| source | varchar(100) | nullable (LinkedIn, referral, JobStreet, etc.) |
| applied_date | date | nullable |
| created_at | timestamp | default now() |
| updated_at | timestamp | auto-updated |

**contacts**
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| job_id | UUID | FK → jobs.id, cascade delete |
| name | varchar(150) | not null |
| role | varchar(150) | nullable (e.g. "Recruiter") |
| email | varchar(255) | nullable |
| phone | varchar(50) | nullable |
| linkedin_url | varchar(500) | nullable |

**notes**
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| job_id | UUID | FK → jobs.id, cascade delete |
| content | text | not null |
| created_at | timestamp | default now() |

Relationships: `User 1—* Job`, `Job 1—* Contact`, `Job 1—* Note`. Every job is scoped to the authenticated user — service layer must always filter by the requester's `user_id`, never trust a client-supplied one.

---

## 5. REST API endpoints

All paths prefixed `/api`. Every endpoint except `/api/auth/*` requires header `Authorization: Bearer <jwt>`.

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Returns JWT |
| GET | `/api/jobs` | List jobs (supports `?status=`, `?company=`, `?page=`, `?size=`) |
| POST | `/api/jobs` | Create job |
| GET | `/api/jobs/{id}` | Get one job |
| PUT | `/api/jobs/{id}` | Full update |
| PATCH | `/api/jobs/{id}/status` | Update status only |
| DELETE | `/api/jobs/{id}` | Delete job |
| GET | `/api/jobs/stats` | Count grouped by status |
| GET | `/api/jobs/{jobId}/contacts` | List contacts |
| POST | `/api/jobs/{jobId}/contacts` | Add contact |
| PUT | `/api/jobs/{jobId}/contacts/{id}` | Update contact |
| DELETE | `/api/jobs/{jobId}/contacts/{id}` | Delete contact |
| GET | `/api/jobs/{jobId}/notes` | List notes |
| POST | `/api/jobs/{jobId}/notes` | Add note |
| DELETE | `/api/jobs/{jobId}/notes/{id}` | Delete note |

Swagger UI is exposed at `/swagger-ui.html` — use it as the manual test console before wiring the frontend.

---

## 6. Backend implementation details

### 6.1 `pom.xml` dependencies
Include: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-security`, `spring-boot-starter-validation`, `postgresql` (runtime), `lombok` (optional, provided), `io.jsonwebtoken:jjwt-api:0.12.6`, `io.jsonwebtoken:jjwt-impl:0.12.6` (runtime), `io.jsonwebtoken:jjwt-jackson:0.12.6` (runtime), `org.springdoc:springdoc-openapi-starter-webmvc-ui:2.5.0`.

### 6.2 `application.yml`
Everything environment-dependent comes from env vars so the same image works in Docker without rebuilding.

```yaml
server:
  port: 8080

spring:
  application:
    name: job-tracker
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:jobtracker}
    username: ${DB_USER:jobtracker}
    password: ${DB_PASSWORD:changeme}
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        format_sql: true

jwt:
  secret: ${JWT_SECRET:change-this-to-a-long-random-string-in-prod}
  expiration-ms: ${JWT_EXPIRATION_MS:86400000}

springdoc:
  swagger-ui:
    path: /swagger-ui.html
  api-docs:
    path: /api-docs

app:
  cors:
    allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:3000}
```

### 6.3 JWT auth flow
1. `POST /api/auth/register` — validate uniqueness of username/email, hash password with `BCryptPasswordEncoder`, save `User`.
2. `POST /api/auth/login` — authenticate via `AuthenticationManager`, on success generate a JWT (`JwtUtil.generateToken(username)`) signed HS256 with `jwt.secret`, return it in an `AuthResponse { token, username }`.
3. `JwtAuthFilter` (extends `OncePerRequestFilter`) — runs on every request, reads the `Authorization` header, validates the token, loads the user via `UserDetailsServiceImpl`, and sets `SecurityContextHolder`.
4. `SecurityConfig` — stateless session (`SessionCreationPolicy.STATELESS`), permits `/api/auth/**` and `/swagger-ui/**` + `/api-docs/**`, everything else requires authentication. Registers `JwtAuthFilter` before `UsernamePasswordAuthenticationFilter`.
5. Controllers pull the current user from `SecurityContextHolder` (via `Authentication.getName()`) — never from a request body field — to scope all job queries to the right owner.

### 6.4 CORS config
Because this never leaves the LAN, keep it simple rather than fighting dynamic IPs:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource(@Value("${app.cors.allowed-origins}") String origins) {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOriginPatterns(List.of(origins.split(",")));
    config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```
`CORS_ALLOWED_ORIGINS` is set in `.env` once you know the server's LAN IP (e.g. `http://192.168.1.50:3000`). **Security note:** this is fine because nothing is exposed past your router. If this ever gets port-forwarded to the public internet, tighten this to an explicit domain and add HTTPS — do not leave it LAN-permissive.

### 6.5 Validation & error handling
- DTOs use `@NotBlank`, `@Email`, `@Size` etc.; controllers annotate params with `@Valid`.
- `GlobalExceptionHandler` (`@RestControllerAdvice`) maps `ResourceNotFoundException` → 404, `MethodArgumentNotValidException` → 400 with field errors, `DuplicateResourceException` → 409, everything else → 500 with a generic message (never leak stack traces to the client).

---

## 7. Frontend implementation details

### 7.1 Pages
- `LoginPage` / `RegisterPage` — forms, call `authApi`, store JWT + username in `localStorage` and `AuthContext` on success, redirect to `/dashboard`.
- `DashboardPage` — fetches `GET /api/jobs`, renders a list of `JobCard`, has a status filter dropdown and an "add job" button opening `JobForm`.
- `JobDetailPage` — single job view: editable fields, nested contacts and notes lists, delete button.

### 7.2 `axiosClient.js`
```js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default axiosClient;
```

### 7.3 API base URL — how it reaches the LAN server
`VITE_API_URL` is a **build-time** env var (Vite bakes it into the static bundle). Since the frontend runs on the homelab box too, this is set once in `.env` at the repo root, e.g.:
```
VITE_API_URL=http://192.168.1.50:8080/api
```
Use `192.168.1.50` only as an example — substitute the server's actual LAN IP (see §9.4 on reserving a static one). If the server's IP ever changes, re-run `docker compose build frontend` with the updated `.env`.

### 7.4 `AuthContext.jsx`
Holds `{ user, token, login(), logout() }`, initialized from `localStorage` on mount so refreshing the page doesn't log the user out. `ProtectedRoute` wraps `DashboardPage`/`JobDetailPage` and redirects to `/login` if there's no token.

---

## 8. Docker packaging

### 8.1 Backend `Dockerfile` (multi-stage)
```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
COPY --from=build /app/target/*.jar app.jar
USER spring
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 8.2 Frontend `Dockerfile` (multi-stage)
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### 8.3 `frontend/nginx.conf`
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
The `try_files` fallback is required for React Router — without it, refreshing on `/dashboard` returns a raw 404 from Nginx.

### 8.4 `.env.example` (copy to `.env`, fill real values, never commit `.env`)
```
# Database
POSTGRES_DB=jobtracker
POSTGRES_USER=jobtracker
POSTGRES_PASSWORD=changeme

# Backend
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRATION_MS=86400000
CORS_ALLOWED_ORIGINS=http://192.168.1.50:3000

# Frontend (build-time)
VITE_API_URL=http://192.168.1.50:8080/api

# Ports exposed on the host
BACKEND_PORT=8080
FRONTEND_PORT=3000
```
Generate `JWT_SECRET` with: `openssl rand -base64 48`

### 8.5 `docker-compose.yml`
```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: jobtracker-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - jobtracker-net

  backend:
    build:
      context: ./backend
    container_name: jobtracker-api
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${POSTGRES_DB}
      DB_USER: ${POSTGRES_USER}
      DB_PASSWORD: ${POSTGRES_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRATION_MS: ${JWT_EXPIRATION_MS}
      CORS_ALLOWED_ORIGINS: ${CORS_ALLOWED_ORIGINS}
    ports:
      - "${BACKEND_PORT}:8080"
    networks:
      - jobtracker-net

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_URL: ${VITE_API_URL}
    container_name: jobtracker-web
    restart: unless-stopped
    depends_on:
      - backend
    ports:
      - "${FRONTEND_PORT}:80"
    networks:
      - jobtracker-net

volumes:
  pgdata:

networks:
  jobtracker-net:
    driver: bridge
```
Note Postgres has **no host port mapping** — it's reachable only from other containers on `jobtracker-net`, by design (nothing needs to reach it directly from the LAN). If you want to poke at the DB with a GUI tool later, see §11.

---

## 9. Ubuntu homelab server setup (CLI, step by step)

Run these directly on the homelab box over SSH or console.

### 9.1 Update the system
```bash
sudo apt update && sudo apt upgrade -y
```

### 9.2 Install Docker Engine + Compose plugin (official repo)
```bash
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 9.3 Let your user run Docker without sudo
```bash
sudo usermod -aG docker $USER
newgrp docker
docker run hello-world   # sanity check
```

### 9.4 Reserve a static LAN IP for the server
Easiest route: log into your router's admin page → DHCP reservation → bind a fixed IP to the server's MAC address (find MAC with `ip link show`). This avoids the server's IP drifting and breaking the frontend's baked-in `VITE_API_URL`.

Alternative (server-side static IP via netplan), only if your router doesn't support reservations:
```bash
ip a   # find your interface name, e.g. eth0
sudo nano /etc/netplan/00-installer-config.yaml
```
```yaml
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: no
      addresses: [192.168.1.50/24]
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
        addresses: [1.1.1.1, 8.8.8.8]
```
```bash
sudo netplan apply
```

### 9.5 Firewall (ufw) — restrict to LAN only
```bash
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from 192.168.1.0/24 to any port 22 proto tcp    # SSH, LAN only
sudo ufw allow from 192.168.1.0/24 to any port 8080 proto tcp  # backend
sudo ufw allow from 192.168.1.0/24 to any port 3000 proto tcp  # frontend
sudo ufw enable
sudo ufw status verbose
```
Adjust `192.168.1.0/24` to match your actual LAN subnet (check with `ip a` on the server, or your router's DHCP range).

### 9.6 Get the project onto the server
Either `git clone` your repo, or `scp` the folder from your dev machine:
```bash
scp -r job-tracker/ your-user@192.168.1.50:~/
```
Then on the server:
```bash
cd ~/job-tracker
cp .env.example .env
nano .env    # fill in real secrets and the server's actual LAN IP
```

### 9.7 Build and run
```bash
docker compose up -d --build
docker compose ps            # confirm all three are healthy/running
docker compose logs -f backend   # tail logs while it starts up
```

### 9.8 Confirm it survives a reboot
`restart: unless-stopped` on every service plus Docker's own systemd service (enabled by default after install) means everything comes back automatically. Verify once:
```bash
sudo reboot
# wait, then reconnect via SSH
docker compose ps
```

---

## 10. Accessing it from the gaming PC

1. On the server, confirm the LAN IP: `ip a` (look for the address on your LAN interface, e.g. `192.168.1.50`).
2. On the gaming PC's browser: `http://192.168.1.50:3000` → the React app.
3. For raw API testing: `http://192.168.1.50:8080/swagger-ui.html`.
4. Optional convenience: add a friendly hostname on the gaming PC by editing `C:\Windows\System32\drivers\etc\hosts` (as admin) and adding a line: `192.168.1.50 jobtracker.home` — then browse to `http://jobtracker.home:3000`.

---

## 11. Verification checklist

- [ ] `docker compose ps` shows `postgres`, `backend`, `frontend` all `Up`/`healthy`
- [ ] `http://<server-ip>:8080/swagger-ui.html` loads and lists all endpoints
- [ ] Register a user via the frontend, confirm row appears (`docker exec -it jobtracker-db psql -U jobtracker -d jobtracker -c "select username from users;"`)
- [ ] Login returns a token and the dashboard loads
- [ ] Create a job, then `docker compose restart` and confirm it's still there (volume persistence check)
- [ ] Open browser devtools on the gaming PC — no CORS errors in the console
- [ ] `docker compose down && docker compose up -d` — everything comes back clean

---

## 12. Optional stretch goals (not required for v1)

- **pgAdmin container** for a DB browser GUI — add as a fourth service, LAN-restricted, only if you want to inspect data visually instead of via `psql`.
- **Portainer** — a web UI for managing containers instead of CLI `docker compose` commands.
- **Automated Postgres backups** — a cron job on the host running `docker exec jobtracker-db pg_dump ...` into a dated file.
- **GitHub Actions CI** — build and validate the Docker images on every push (doesn't need to deploy anywhere, just catches broken builds early).
- **Stats dashboard** — a small chart on the frontend using the `/api/jobs/stats` endpoint (recharts pairs well with the React/MERN background).

---

## 13. Build order (summary)

1. Scaffold `backend/` with the package structure in §3, entities from §4, using Spring Initializr or manually.
2. Implement auth (register/login/JWT filter/security config) first — test via Swagger before building anything else.
3. Implement Job/Contact/Note CRUD, scoped to the authenticated user.
4. Write `application.yml`, verify the backend runs standalone against a local Postgres (`docker run` a throwaway Postgres container for this step) before touching Docker Compose.
5. Scaffold `frontend/` with Vite, build auth pages first, then dashboard, then job detail.
6. Point the frontend at the local backend (`VITE_API_URL=http://localhost:8080/api`) and verify the full flow works on your dev machine.
7. Write both Dockerfiles, `nginx.conf`, `docker-compose.yml`, `.env.example`.
8. `docker compose up -d --build` locally first, sanity-check, then repeat on the homelab server per §9.
9. Run through the §11 checklist from the gaming PC.
10. Only then consider §12 extras.
