# TEE Backend Service

A NestJS backend service for handling TEE (Trusted Execution Environment) operations, including deposit events, intent matching, and merkle proof generation.

## Description

This service provides a robust backend for:
- Listening to deposit events from smart contracts
- Processing and matching trading intents
- Managing state and merkle proofs
- Handling deposit updates from the blockchain

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start:dev

# debug mode
$ npm run start:debug

# production mode
$ npm run start:prod
```

## Docker Setup

The application is containerized using Docker. To build and run the container:

```bash
# Build the Docker image
docker build -t nesttee .

# Run the container
docker run -p 3011:3011 nesttee
```

The container exposes port 3011 by default. You can map it to a different port on your host machine by changing the first number in the port mapping (e.g., `-p 8080:3011`).

## Environment Variables

Create a `.env` file based on `.env.example` with the following variables:
- `PORT`: Server port (default: 3000)
- `RPC_URL`: Ethereum RPC URL
- `SOLO_PATTY_CONTRACT`: Smart contract address
- `TEE_PRIVATE_KEY`: Private key for TEE operations

When running in Docker, make sure to pass these environment variables to the container using the `-e` flag or by using a `.env` file:

```bash
docker run -p 3011:3011 --env-file .env nesttee
```

## API Endpoints

- `POST /intent/submit` - Submit encrypted intents
- `POST /intent/match` - Match trading intents
- `GET /state` - Get current state
- `POST /state/merkle-root` - Update merkle root
- `POST /proof` - Generate merkle proof
- `POST /deposit` - Update deposits from chain

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

[MIT licensed](LICENSE)
