const User = require("../models/userModels");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
const { text } = require("express");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  // console.log(user._id);
  // console.log(user.email);
  // console.log(name);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  createSendToken(newUser, 202, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) check if email and pasword exist
  if (!email || !password) {
    return next(new AppError("email  ve sifrenizi giriniz", 400));
  }

  // 2) check if user and pass is correct
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("isim veya sifre hatali", 401));
  }

  // 3) if everythis is okay send the token
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1 check the token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("giris yapmadiniz", 401));
  }
  // 2 validate token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3 check if user still exists

  const freshUser = await User.findById(decode.id);
  if (!freshUser) {
    return next(new AppError("Kullanici bulunmamaktadir", 401));
  }
  // 4 check if user changed password after the token was issued
  if (freshUser.changePasswordAfter(decode.iat)) {
    return next(
      new AppError(
        "sifrenizde degisiklik yapmissiniz lutfen yeni sifre ile giris yapiniz"
      )
    );
  }

  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // const user = req.user;
    if (!roles.includes(req.user.role)) {
      // console.log(req.params.birim);
      // console.log(req.user);
      return next(
        new AppError("You dont have permission to perform this action ", 403)
      );
    }
    next();
  };
};
exports.forgetPassword = catchAsync(async (req, res, next) => {
  //1-)get email posted by user
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("No User with this email", 404));
  }
  //2-) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3-) send it to user
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const clientURL = `${req.protocol}://localhost:3000/updatepassword?token=${resetToken}`;

  const messageSent = `submit a patch req  to: ${resetURL} `;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password Reset Token (valid for only 10 mins)",
      message: messageSent,
      html: `<b>Forgot Password , Here is your reset link:  </b><br> <p> <a href="${clientURL}">${clientURL}</a></p>
            `,
      text: messageSent,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err);
    return next(
      new AppError("There was an error sending the email Try again later"),
      500
    );
  }
  console.log("reset URL", resetURL);
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }); // user with reqd token and if the token expire time is valid or not

  // 2) If the token is not expired(10 minutes) and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt  property of the user

  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  // console.log("logout Endpoint");
  res.clearCookie("jwt");
  res.status(200).json({ status: "success" });
  // console.log('Logout Triggered');
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  console.log("updateMyPassword Triggered");
  // console.log('Password reset req');
  //get user from the collection

  const user = await User.findById(req.user.id).select("+password");
  // check if the current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("HATALI SIFRE", 401));
  }
  // if so update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // log the user in , send JWT
  createSendToken(user, 200, res);

  console.log("updateMyPassword Ended");
});
