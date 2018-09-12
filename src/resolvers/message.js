import uuidv4 from 'uuid/v4';
import { ForbiddenError } from 'apollo-server';
import { combineResolvers } from 'graphql-resolvers';

import { isAuthenticated, isMessageOwner } from './authorization';

export default {
	Query: {
		messages: async (_, args, { models }) => {
      return await models.Message.findAll();
    },
		message: async (parent, { id }, { models }) => {
      return await models.Message.findById(id);
    },
	},

	Mutation: {
		createMessage: combineResolvers(
			isAuthenticated,
			async (_, { text }, { me, models }) => {
				return await models.Message.create({
					text,
					userId: me.id,
				});
			}
		),
		deleteMessage: combineResolvers(
			isMessageOwner,
			async (_, { id }, { models }) => {
				return await models.Message.destroy({ where: { id } })
			}
		),
	},

	Message: {
		user: async (message, args, { models }) => {
      return await models.User.findById(message.userId);
    }
	}
};
