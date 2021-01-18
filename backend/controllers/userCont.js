import User from "../models/userModel.js"
import bcrypt from "bcryptjs"
import { generateToken } from "../middleware/generateToken.js"

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res
        .status(400)
        .json({ messsage: "Not all fields have been completed" })
    }

    const user = await User.findOne({ email })

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(400).json({ msg: "Invalid Credentials" })
    }

    if (user) {
      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      })
    }
    return res.status(401).json({ messsage: "invalide credentials" })
  } catch (error) {
    return res.status(500).json({ error: error.messsage })
  }
}

export const registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, passwordCheck } = req.body

    if (!email || !password || !passwordCheck || !firstName || !lastName) {
      return res
        .status(400)
        .json({ messsage: "Not all fields have been completed" })
    }

    if (password.length < 5) {
      res
        .status(400)
        .json({ messsage: "The password needs to be at least 5 characters" })
    }

    if (password !== passwordCheck) {
      res.status(400).json({ messsage: "Enter the same password twice" })
    }

    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ messsage: "user exists " })
    }
    const salt = await bcrypt.genSalt(10)
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
    })
    if (user) {
      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        password: await bcrypt.hash(password, salt),
        token: generateToken(user._id),
      })
    }

    return res.send(user)
  } catch (error) {
    return res.status(500).json({ error: error.messsage })
  }
}
