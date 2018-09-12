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
		},
		role: {
      type: DataTypes.STRING,
    },
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
			console.log("=====>",user, login)
			return user;
		}

		User.prototype.validatePassword = async function(password) {
			return bcrypt.compare(password, this.password);
		};

		return user;
	};

	User.beforeCreate(async user => {
    user.password = await user.generatePasswordHash();
  });

  User.prototype.generatePasswordHash = async function() {
    const saltRounds = 10;
    return await bcrypt.hash(this.password, saltRounds);
  };

	return User;
};

export default user;
