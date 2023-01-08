const bcrypt = require('bcryptjs');
global.crypto = require('crypto')
const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Zorunlu Alan'],
    unique: [true, 'Position already exists']
  },
  password: {
    type: String,
    required: [true, 'Alan zorunlu'],
    minlength: 8,
    select: false
  },

  role: {
    type: String,
    enum: ['user', 'admin', 'superAdmin'],
    default: 'user',

  },
  passwordConfirm: {
    type: String,
    required: [true, 'sifrenizi dogrulayin'],
    //only works for save 
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'sifreler ayni degildir'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  email: {
    type: String,
    required: [true, 'Alan zorunludur'],
    lowercase: true,
    unique: true,
    validator: [validator.isEmail, 'gecersiz email']
  }
}, { collection: 'userPasswords' });
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save',function(next){
  if(this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now - 1000;
  next();
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    console.log(this.changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
}
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    console.log({resetToken}, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 *1000;
  return resetToken;
}
User = mongoose.model('User', userSchema);
module.exports = User;