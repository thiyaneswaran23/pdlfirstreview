const { PrismaClient } = require('@prisma/client');
const express = require('express');
const cors=require("cors");



const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cors());
// Example route to fetch all users (for debugging or display purposes)
app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Route to sign up a new user
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  // Check if both email and password are provided
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Check if the email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists.' });
    }

    // Create a new user
     // Respond with the created user
  } catch (error) {
    console.error('Error signing up user:', error);
    res.status(500).json({ error: 'Error signing up user', details: error.message });
  }
  const newUser = await prisma.user.create({
    data: {
      email: email,
      password: password // Store the password as is (for production, consider hashing it using bcrypt)
    }
  });

  res.status(201).json(newUser);
});

// Route to sign in an existing user
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  // Check if both email and password are provided
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found.' });
    }

    // Check if the password matches
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    res.status(200).json({ message: 'Sign-in successful', user });
  } catch (error) {
    console.error('Error signing in user:', error);
    res.status(500).json({ error: 'Error signing in user', details: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
