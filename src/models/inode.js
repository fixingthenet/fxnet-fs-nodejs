'use strict';
module.exports = (sequelize, DataTypes) => {
    const Inode = sequelize.define('Inode', {
        parent_id: {
            type: DataTypes.BIGINT
        },
        name: {
            type: DataTypes.STRING
        },
        is_folder: {
            type: DataTypes.BOOLEAN
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
        paranoid: false,
        underscored: true,
        tableName: 'inodes'
    }
                                  );
    Inode.prototype.child= async function(name) {
        if (this.is_folder) {
            return await Inode.findOne({where: {parent_id: this.id,
                                                name: name
                                               }})
        } else {
            throw "Only folder have children."
        }

    }
    Inode.prototype.children = async function()  {
        if (this.is_folder) {
            return await Inode.findAll({where: {parent_id: this.id}})
        } else {
            throw "Only folder have children."
        }
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
                WHERE inodes.name = regexp_replace(rest_path, '([^/]+).*', '\\1')
             ) select * from inodes_full order by depth`,
                                                 { replacements:
                                                   {startPath: pathWithoutSlash},
                                                   model: Inode,
                                                   mapToModel: true,
                                                   type: sequelize.QueryTypes.SELECT})
        return inodesPath;
    }

    return Inode;
};
