# Atsumeru-Deluge

Quickly add torrents to Deluge.

## Usage

### Docker

`docker run -e PORT=3000 -e DELUGE_PASSWORD=deluge -e DELUGE_ADDRESS=http://127.0.0.1:8112/json -p 3000:3000 colmarek/atsumeru-deluge`

### Node

Create a `.env` file based on `.env.sample`

```
cp .env.sample .env
```

Install dependencies

```
yarn install
```

Start

```
yarn start
```

http://localhost:3000
