"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Option extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Option.hasMany(models.Vote, {
        foreignKey: "OId",
        onDelete: "CASCADE",
      });

      Option.belongsTo(models.Question, {
        foreignKey: "QId",
        onDelete: "CASCADE",
      });
    }

    static async getAllOptionsOfQuestion({ QId }) {
      if (!QId) {
        throw new Error("Question Id is required");
      }
      const options = await Option.findAll({
        where: {
          QId: QId,
        },
      });
      return options;
    }

    static async createOption({ desc, QId }) {
      if (!desc || !QId) {
        throw new Error("Option description and Question Id are required");
      }
      const option = await Option.create({
        desc: desc,
        QId: QId,
      });
      return option;
    }

    static async doesOptionBelongToQuestion({ QID, OID }) {
      // console.log(OID, QID)
      if (!QID || !OID) {
        throw new Error("Question Id and Option Id are required");
      }
      return await Option.findOne({
        where: {
          QId: QID,
          id: OID,
        },
      });
    }
    static async deleteAlloptionsOfQuestion({ optionIDs }) {
      if (optionIDs.length === 0) {
        throw new Error("OLD Option IDs are required");
      }
      return await Option.destroy({
        where: {
          id: optionIDs,
        },
      });
    }
  }
  Option.init(
    {
      desc: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Option description cannot be null",
          },
          notEmpty: {
            msg: "Option description cannot be empty",
          },
          islen: function (value) {
            if (value.length < 3 || value.length > 255) {
              throw new Error(
                "Option description must be between 3 and 255 characters long"
              );
            }
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Option",
    }
  );
  return Option;
};
