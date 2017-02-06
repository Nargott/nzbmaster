let Sequelize = require('sequelize');

module.exports = () => {
    return {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        uuid: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false,
        },

        ip: {
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