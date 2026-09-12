
# Secure Backend API with Authentication and CRUD Operations

This project was created to learn and gain hands-on experience with Node.js, Express, JWT-based authentication, and modern backend development practices. It provides a secure REST API with user authentication and authorization, allowing users to register, log in, and access protected resources.

The application includes complete CRUD functionality for managing movies, along with a personalized watchlist system where users can track movies they plan to watch, are currently watching, have completed, or have dropped. Users can also rate movies and add optional notes to their watchlist entries.

The project incorporates modern backend development practices, including password hashing with bcryptjs, JWT authentication middleware, request validation using Zod, and centralized error handling. Oracle Express is used as the backned database. The application is designed as a practical end-to-end project for learning how to build secure, structured, and maintainable backend APIs.

## Prerequisites

- **NodeJS**: Version 18 or higher
- **Oracle Database XE**: For this project we used Oracle XE.

## Tech Stack

- **NodeJS**: JavaScript runtime for server-side development
- **Express.js**: Fast, minimalist web framework for Node.js
- **Oracle XE**: Oracle express edition
- **Zod**: TypeScript-first schema validation library
- **bcryptjs**: TypeScript-first schema validation library
- **dotenv**: Environment variable management
- **Docker**: For deployment - Dockerfile is provided for creating the dockmer image
- **docker-compose**: Sample file for creating the container.

## Setup

1. **Clone Repository:**
   ```bash
   git clone https://github.com/yourusername/backend-orcl.git
   cd backend-orcl
   
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   DATABASE_USER=
   DATABASE_PASSWORD=
   DATABASE_URI=DBHOST:PORT/DB_SERVICE
   PORT=8090
   POOL_MIN=1
   POOL_MAX=10
   POOL_INCREMENT=1
   NODE_ENV="development"
   JWT_SECRET="" # Create Secret
   JWT_EXPIRES_IN="7d"
   ```
4. **Start the server:**
   ```bash
   npm run dev
   ```
5. **Test the APIs with swagger:**
   ```bash
   Access the following link and test the available APIs
   http://localhost:8000/docs#
   ```
6. **Docker containerization:**
 ```bash
   - This is required only for deploying the application on a docker host.
   - Refer included Dockerfile for creating the docker image
     To build the image:
         Goto the application folder
         docker build -t movie-api:1.0 .     
   - Sample Docker compose file is also included
     To start the container:
     docker compose up -d 

```
8. **If WSL (Windows Subsystem for Linux) is used for docker:**
 ```bash
   - Open the Firewall and allow port forwarging, so other container can be accessed from the netwok
   - Sampe port forwarding command using Powershell:
     netsh interface portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=8080 connectaddress=172.20.141.18
     Note: 172.20.141.18 is the Linux ip (docker host ip)
   - Sample Firewall Rule:
     netsh advfirewall firewall add rule name="WSL 8080" protocol=TCP dir=in localport=8080 action=allow
``` 

## API Usage Examples

### User Registration
```bash
curl http://localhost:8080/register/
```
### User Login
```bash
curl http://localhost:8080/login/
```
### Get movie details
```bash
curl http://localhost:8080/movies/4
```

### Add movie - Post method
```bash
curl http://localhost:8080/movies
```

### Add Movie to the watch list
```bash
curl http://localhost:8080/watchlist
```