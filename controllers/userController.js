const User = require("../models/userModels");
const authController = require("./authController");

//get already existed user
exports.getUsers = async (req, res) => {
  try {
    const newUser = await User.find();

    res.status(201).json({
      status: "success",
      data: {
        User: newUser,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

//create user
exports.postUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        User: newUser,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

//find user by id
exports.getUser = async (req, res) => {
  try {
    const newUser = await User.findById(req.params.id);
    res.status(201).json({
      status: "success",
      data: {
        User: newUser,
      },
    });
  } catch (err) {
    console.log(err);
  }
};
//update user
exports.updateUser = async (req, res) => {
  try {
    const newUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(201).json({
      status: "success",
      data: {
        User: newUser,
      },
    });
    console.log("Update Req: ", req);
  } catch (err) {
    console.log(err);
  }
};
exports.deleteUser = async (req, res) => {
  try {
    dpt = null;
    dpt = await User.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    console.log(err);
  }
};
