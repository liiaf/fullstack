const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user.js')

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    .populate('blogs', { __v: 0 })
  response.json(users.map(User.formatNoHash))
})

usersRouter.post('/', async (request, response) => {
  try {
    const body = request.body;

    if (!body.username) {
      return response.status(400).json({ error: 'missing username' })
    }
    if (!body.password) {
      return response.status(400).json({ error: 'missing password' })
    }
    if (body.password.length < 3) {
      return response.status(400).json({ error: 'password must be at least 3 characters long' })
    }

    const result = await User.find({ username: body.username })
    if (result.length !== 0) {
      return response.status(400).json({ error: 'username must be unique' })
    }


    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRounds)
    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash: passwordHash,
    })

    const savedUser = await user.save();
    response.status(201).json(savedUser);
  } catch (exception) {
    console.log(exception);
    response.status(500).json({ error: 'there is a problem...' })
  }
})

module.exports = usersRouter