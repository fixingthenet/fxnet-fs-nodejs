const iNode = require("jsDAV/lib/DAV/interfaces/iNode");
const iProps = require("jsDAV/lib/DAV/interfaces/iProperties");
const StoragePath = require("../../lib/storage_path")
var Exc = require("jsDAV/lib/shared/exceptions");



var FSNode = iNode.extend(
    iProps,
    {
        initialize(storagePath, tree) {
            this.storagePath=storagePath
            this.inode=storagePath.inode
            this.tree=tree
        },

        path() {
            return this.storagePath.path
        },

        isExisting() {
            return this.storagePath.isExisting
        },

        getName() {
            return this.storagePath.name
        },

        getLastModified() {
            return this.inode.modified_at
        },

        async moveToParent(newParent, newName) {
            await this.storagePath.move(newParent.storagePath,
                                        newName)
        },

        async copyToParent(destParentNode,name) {
            //we should wrap it here
            return await this.storagePath.copy(destParentNode.storagePath,
                                               name)
        },

        async updateProperties(props) {
            //don't update {DAV:} props
            return await this.storagePath.updateProperties(props)
        },
        async getProperties(props) {
            //filter props? no too lazy
            return await this.storagePath.getProperties(props)
        },

        readAllowed() {
            var readers = this.storagePath.inode.readers
            var admins = this.storagePath.inode.admins
            if (admins.indexOf(this.tree.userContext().user.id.toString())>=0 ||
                readers.indexOf(this.tree.userContext().user.id.toString())>=0) {
            } else {
                throw( new Exc.Forbidden('You are not allowed to read this.'))
            }
        },

        writeAllowed() {
            var writers = this.storagePath.inode.writers
            var admins = this.storagePath.inode.admins
            if (admins.indexOf(this.tree.userContext().user.id.toString())>=0 ||
                writers.indexOf(this.tree.userContext().user.id.toString())>=0) {
            } else {
                throw( new Exc.Forbidden('You are not allowed to change this.'))
            }
        },

        adminAllowed() {
            var admins = this.storagePath.inode.admins
            if (admins.indexOf(this.tree.userContext().user.id.toString())>=0) {
            } else {
                throw( new Exc.Forbidden('You are not allowed to change this.'))
            }
        }
    })


module.exports = FSNode;
