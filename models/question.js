"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Question.hasMany(models.Vote, {
        foreignKey: "QId",
        onDelete: "CASCADE",
      });

      Question.hasMany(models.Option, {
        foreignKey: "QId",
        onDelete: "CASCADE",
      });

      Question.belongsTo(models.Elections, {
        foreignKey: "EId",
        onDelete: "CASCADE",
      });
    }

    // Get all questions of an election with options from Option model
    static async getAllQuestionsofElection({ EId, UId }) {
      if (!EId || !UId) {
        throw new Error("Election Id and User Id are required");
      }
      const questions = await Question.findAll({
        where: {
          EId,
        },
        include: [
          {
            model: sequelize.models.Elections,
            where: {
              UId: UId,
              id: EId,
            },
          },
        ],
      });
      return questions;
    }

    static async getQuestion({ QId, EId }) {
      if (!QId || !EId) {
        throw new Error("Question Id and Election Id are required");
      }
      const question = await Question.findOne({
        where: {
          id: QId,
          EId: EId,
        },
      });
      return question;
    }

    static async getQuesionsOfElection({ EId }) {
      if (!EId) {
        throw new Error("Election Id is required");
      }
      const questions = await Question.findAll({
        where: {
          EId: EId,
        },
      });
      return questions;
    }

    static async deleteQuestion({ QId, EID }) {
      if (!QId || !EID) {
        throw new Error("Question Id and Election Id are required");
      }
      return await Question.destroy({
        where: {
          id: QId,
          EId: EID,
        },
      });
    }

    static async createQuestion({ title, desc, EId }) {
      if (!title || !desc || !EId) {
        throw new Error("Title, description and Election Id are required");
      }
      const question = await Question.create({
        title: title,
        desc: desc,
        EId: EId,
      });
      return question;
    }

    static async updateQuestion(question) {
      if (!question) {
        throw new Error("Question cannot be null");
      }
      if (!question.title || !question.desc) {
        throw new Error("Title or description cannot be empty");
      }
      const updatedQuestion = await Question.update(
        {
          title: question.title,
          desc: question.desc,
        },
        {
          where: {
            id: question.id,
          },
        }
      );
      return updatedQuestion;
    }
  }
  Question.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Title cannot be null",
          },
          notEmpty: {
            msg: "Title cannot be empty",
          },
          islen: function (value) {
            if (value.length < 3 || value.length > 100) {
              throw new Error("Title must be between 3 and 100 characters");
            }
          },
        },
      },
      desc: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Description cannot be null",
          },
          notEmpty: {
            msg: "Description cannot be empty",
          },
          islen: function (value) {
            if (value.length < 3 || value.length > 500) {
              throw new Error(
                "Description must be between 3 and 500 characters"
              );
            }
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Question",
    }
  );
  return Question;
};
