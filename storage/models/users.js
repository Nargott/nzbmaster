let Sequelize = require('sequelize');

module.exports = () => {
    return {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        userName: {
            type: Sequelize.STRING,
            field: 'user_name',
            unique: true,
            allowNull: false,
        },

        passHash: {
            type: Sequelize.STRING,
            allowNull: false,
        },

        maxConnections: {
            type: Sequelize.STRING,
            allowNull: false
        },

        createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            field: 'created_at',
            allowNull: false
        },

        lastActivityAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            field: 'last_activity_at',
            allowNull: true
        }
    };
};