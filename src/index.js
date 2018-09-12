require('dotenv').config();
import express from 'express';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());

import schema from './schema';
import resolvers from './resolvers';
import models, { sequelize } from './models';

const getMe = async (req) => {
	const token = req.headers['x-token'];

	if (token) {
		try {
			return await jwt.verify(token, process.env.SECRET);
		} catch (e) {
			throw new AuthenticationError('Your session expired. Sign in again.');
		}
	}
};

const server = new ApolloServer({
	typeDefs: schema,
	resolvers,
	formatError: (error) => {
		const message = error.message.replace('SequelizeValidationError: ', '').replace('Validation error: ', '');

		return {
			...error,
			message
		};
	},
	context: async ({ req }) => {
		const me = await getMe(req);
		return {
			models,
			me,
			secret: process.env.SECRET
		};
	}
});

server.applyMiddleware({ app, path: '/graphql' });

const eraseDatabaseOnSync = true;

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
	if (eraseDatabaseOnSync) {
		createUsersWithMessages();
	}
	app.listen({ port: 8080 }, () => {
		console.log('🚀  Server ready at port 8080');
	});
});

const createUsersWithMessages = async () => {
	await models.User.create(
		{
			username: 'Febriliando',
			email: 'me@febriliando.com',
			password: 'encrypt',
			role: 'ADMIN',
			messages: [
				{
					text: 'Published'
				}
			]
		},
		{
			include: [ models.Message ]
		}
	);

	await models.User.create(
		{
			username: 'Putra',
			email: 'you@febriliando.com',
			password: 'decrypt',
			messages: [
				{
					text: 'Happy to release ...'
				},
				{
					text: 'Published a complete ...'
				}
			]
		},
		{
			include: [ models.Message ]
		}
	);
};
