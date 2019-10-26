'use strict';
module.exports = (sequelize, DataTypes) => {
    const Inode = sequelize.define('Inode', {
        parent_id: {
            type: DataTypes.BIGINT
        },
        backend_id: {
            type: DataTypes.BIGINT
        },
        name: {
            type: DataTypes.STRING
        },
        is_folder: {
            type: DataTypes.BOOLEAN
        },
        storage_key: {
            type: DataTypes.STRING
        },
        sha512: {
            type: DataTypes.STRING
        },
        content_type_major: {
            type: DataTypes.STRING
        },
        content_type_minor: {
            type: DataTypes.STRING
        },
        content_type_charset: {
            type: DataTypes.STRING
        },
        content_size: {
            type: DataTypes.BIGINT
        },
        readers: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        writers: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        admins: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        created_at: {
            type: DataTypes.DATE
        },
        deleted_at: {
            type: DataTypes.DATE
        },
        updated_at: {
            type: DataTypes.DATE
        },
        modified_at: {
            type: DataTypes.DATE
        },
    }, {
        paranoid: true,
        underscored: true,
        tableName: 'inodes',
//        deletedAt: 'deleted_at'
    }

                                  );
    Inode.prototype.copy= async function(parentInode, name) {
        if (!this.is_folder) {
            var attributes = this.get({plain: true})
            delete(attributes.id)
            attributes.parent_id=parentInode.id;
            attributes.name=name;
            console.log("attributes:", attributes)
            return await Inode.create(attributes)
        } else {
            throw "don't know how to copy folders"
        }
    }


    Inode.prototype.child= async function(name) {
        if (this.is_folder) {
            return await Inode.findOne({where: {parent_id: this.id,
                                                name: name,
                                                deleted_at: null
                                               }})
        } else {
            throw "Only folder have children."
        }
    }

    Inode.prototype.children = async function()  {
        if (this.is_folder) {
            return await Inode.findAll({where: {parent_id: this.id,
                                                deleted_at: null
                                               }})
        } else {
            throw "Only folder have children."
        }
    }
    Inode.deleteDescendants = async function(id) {
        await sequelize.query(`
            WITH RECURSIVE inodes_full AS (
            SELECT inodes.id,inodes.parent_id
            FROM inodes
            WHERE id = :id
            UNION ALL
            SELECT inodes.id, inodes.parent_id
            FROM inodes_full
            JOIN inodes ON inodes_full.id = inodes.parent_id
            WHERE inodes.deleted_at IS NULL
        ) UPDATE inodes SET deleted_at=:now
          FROM inodes_full WHERE inodes_full.id=inodes.id`,
                                                 { replacements:
                                                   {id: id,
                                                    now: new Date(),                                          },
                                                   type: sequelize.QueryTypes.UPDATE
                              }
                             )
    }

    Inode.resolvePath = async function(path,userId) {
        if (path.slice(0,1) != '/') {
            throw "Abolute path required"
        }
        var pathWithoutSlash=path.slice(1,path.length)


        var inodesPath =  await sequelize.query(`
            WITH RECURSIVE inodes_full AS (
                SELECT inodes.*,
                       0 AS depth,
                       :startPath AS rest_path
                FROM inodes
                WHERE name = '/'
                UNION ALL
                SELECT inodes.*, depth + 1, regexp_replace(rest_path, '[^/]+/?(.*)', '\\1')
                FROM inodes_full
                JOIN inodes ON inodes_full.id = inodes.parent_id
                WHERE inodes.name = regexp_replace(rest_path, '([^/]+).*', '\\1') AND inodes.deleted_at IS NULL
             ) select * from inodes_full order by depth`,
                                                 { replacements:
                                                   {startPath: pathWithoutSlash},
                                                   model: Inode,
                                                   mapToModel: true,
                                                   type: sequelize.QueryTypes.SELECT})
        return inodesPath;
    }


    Inode.associate = function(models) {
        console.log("Assoc: Inode -> Backend", models.Backend.name)
        Inode.Backend=Inode.belongsTo(models.Backend, {foreignKey: 'backend_id',
                                                       as: 'backend'});
    };
    return Inode;
};
