# Fxnet FS (nodejs)

A multi api and multi backend meta filesystem.
Currently supported frontend apis:
 * webdav

Currently supported backends:
 * local fs
 * local hashed fs

## About

## Architecture


## Setup

You need 
 * fxnet-auth
 * postgresql


## Configuration

Environment variables 
```
AUTH_API_URL 		url to your fxnet-auth backend (e.g. http://dev-auth-api.fixingthe.net/)
DB_DATABASE 		name of the database e.g. "fs"
DB_HOST 		host of the database e.g. "postgres96.dev-central"
DB_PASSWORD 		password of the db
DB_USERNAME 		username of the db
```

## Operation
### Exmaples with curl
```
curl -i -X PROPFIND http:///dev-fs.fixingthe.net/ --upload-file - -H "Depth: 1" <<end
<?xml version="1.0"?>
<a:propfind xmlns:a="DAV:">
<a:prop><a:resourcetype/></a:prop>
</a:propfind>
end
```
## Development
