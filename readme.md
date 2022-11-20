## Redis

### Data Model

* `queue` is a Redis `list` of uuids (strings)
* `jobs:<uuid>` is a hashset containing the following keys

|     key     |              type               |
| ----------- | ------------------------------- |
| date        | string (iso8601)                |
| status      | string (WAITING,RENDERING,DONE) |
| documentKey | string                          |
| claim       | string (json)                   |
| pdfUrl      | string                          |

# Start up
Using docker-compose, the whole system can be started with 

```sh
sh ./start.sh
```

## Before Startup
### Crypto
Generate a new key pair with 

```sh
openssl ecparam -name prime256v1 -genkey -noout -out ./deployment/secrets/ec256-key-pair.pem
```
