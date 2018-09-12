require('dotenv').config();
import express from 'express';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import http from 'http';

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
	context: async ({ req, connection }) => {
		if(connection) {
			return {
				models
			}
		}
		if(req) {
			const me = await getMe(req);
			return {
				models,
				me,
				secret: process.env.SECRET
			};
		}
	}
});

server.applyMiddleware({ app, path: '/graphql' });

const httpSrever = http.createServer(app);
server.installSubscriptionHandlers(httpSrever)

const eraseDatabaseOnSync = true;

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
	if (eraseDatabaseOnSync) {
		createUsersWithMessages(new Date());
	}
	httpSrever.listen({ port: 8080 }, () => {
		console.log('🚀  Server ready at port 8080');
	});
});

const createUsersWithMessages = async date => {
	await models.User.create(
		{
			username: 'Febriliando',
			email: 'me@febriliando.com',
			password: 'encrypt',
			role: 'ADMIN',
			messages: [
				{
					text: 'Published',
					createdAt: date.setSeconds(date.getSeconds() + 1),
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
					text: 'Happy to release ...',
					createdAt: date.setSeconds(date.getSeconds() + 1),
				},
				{
					text: 'Published a complete ...',
					createdAt: date.setSeconds(date.getSeconds() + 1),
				}
			]
		},
		{
			include: [ models.Message ]
		}
	);
};
