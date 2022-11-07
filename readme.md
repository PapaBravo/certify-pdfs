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