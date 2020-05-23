# Fxnet FS (nodejs)
## About
A multi api and multi backend meta filesystem. Mutli api means this server
provides differend apis so existing applications/clients can connect to it
without modifications.

Multibackend means it can store data in different formats on different
backends (like s3, dropbox, ....)

So the goal is to see a consistant filesystem over a lot of storages.

Another problem to solve was scaling. Most web filesystem implmentations
don't scale for enterprise usage, this should (not google like but enough
for some terrabites and esp. for huge files)

### frontend apis
Implemented
 * webdav

Planed
 * TOS
 * native REST
 * nfs
 * ftp https://github.com/alanszlosek/nodeftpd
 * smb https://github.com/adobe/node-smb-server
 * TUS https://tus.io/
 * native graphql
 * s3 v3/4
 * hadoopfs

## Backends
### MirroredLocal
Stores files on the local filesystem. Runs filesystem native commands.
This is currently a one way street (already exisintg files are ignored).
### HashedLocal
Doesn't care about directories but just cares about data. So files are stored
in files like "01f/78b/e6f/7cad02658508fe4616098a9-550".

Pros
 * moves are only done in the meta filesystem

### Planed
 * dropbox
 * s3
 * gdrive

## Setup

You need to
 * install fxnet-auth
 * setup postgresql
 * I recommend a docker setup but that optional
 * configure fxnet-fs (see below)
 * run the migrations: ```sequelize db:migrate```
 * run the seeds:  ```sequelize db:seed:all```


## Configuration

Environment variables
```
AUTH_API_URL 		url to your fxnet-auth backend (e.g. http://dev-auth-api.fixingthe.net/)
DB_DATABASE 		name of the database e.g. "fs"
DB_HOST 		host of the database e.g. "postgres96.dev-central"
DB_PASSWORD 		password of the db
DB_USERNAME 		username of the db
```

Currently there's no api to mount filesystems so you can only create folders
(the  JustMeta backend is mounted on root)

For setup run bin/setup. Will create a public folder.

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
