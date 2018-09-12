import jwt from 'jsonwebtoken';
import { AuthenticationError, UserInputError } from 'apollo-server';
import bcrypt from 'bcrypt';

const createToken = async (user, secret, expiresIn) => {
  const { id, email, username } = user;
  return await jwt.sign({ id, email, username }, secret, {
    expiresIn,
  });
};

const generatePasswordHash = async function(password) {
	const saltRounds = 5;
	return await bcrypt.hash(password, saltRounds);
};

export default {
	Query: {
		users: async (parent, args, { models }) => {
			return await models.User.findAll();
		},
		user: async (parent, { id }, { models }) => {
			return await models.User.findById(id);
		},
		me: async (parent, args, { models, me }) => {
      if (!me) {
        return null;
      }
			return await models.User.findById(me.id);
		}
	},
	Mutation: {
		signUp: async (
			parent,
			{ username, email, password },
			{ models, secret }
		) => {
			const newPassword = await generatePasswordHash(password);

			const user = await models.User.create({
				username: username,
				password: newPassword,
				email: email
			});

			return { token: createToken(user, secret, '30m') };
		},
		signIn: async (
			parent,
			{ login, password },
			{ models, secret }
		) => {
			const user = await models.User.findById(login);
			if(!user) {
				throw new UserInputError(
					'No User found with login credential'
				)
			}
			const isValid = await user.validatePassword(password)
			if(!isValid) {
				throw new AuthenticationError(' Invalid Password ')
			}
			return { token: createToken(user, secret, '30m') }
		}
	},
	User: {
		messages: async (user, args, { models }) => {
			return await models.Message.findAll({
				where: {
					userId: user.id
				}
			});
		}
	}
};
