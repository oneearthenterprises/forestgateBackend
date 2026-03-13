import Newslatter from "../models/Newslatter.js";

export const newsletter = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Please provide email",
      });
    }
    const user = await Newslatter.findOne({ email });
    if (user) {
      return res.status(409).json({
        message: "User already exists",
      });
    }
    const newUser = await Newslatter.create({ email });
    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getNewsletter = async (req, res) => {
  try {
    const users = await Newslatter.find().sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Newsletter users fetched successfully",
      total: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
