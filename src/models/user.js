import bcrypt from 'bcrypt';

const user = (sequelize, DataTypes) => {
	const User = sequelize.define('user', {
		username: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
			validate: {
				notEmpty: true
			}
		},
		email: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
			validate: {
				notEmpty: true,
				isEmail: true
			}
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		}
	});

	User.associate = (models) => {
		User.hasMany(models.Message);
	};

	User.findByLogin = async (login) => {
		let user = await User.findOne({
			where: { username: login }
		});

		if (!user) {
			user = await User.findOne({
				where: { email: login }
			});
		}

		User.prototype.validatePassword = async function(password) {
			return bcrypt.compare(password, this.password);
		};

		return user;
	};

	return User;
};

export default user;
