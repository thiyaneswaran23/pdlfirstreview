const { PrismaClient } = require('@prisma/client');
const express = require('express');
const cors = require("cors");
const bcrypt = require('bcrypt'); 
const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cors());

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[a-zA-Z\d\W_]{8,}$/;


app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

 
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  
  if (!password || !passwordRegex.test(password)) {
     res.status(400).json({
      error: 'Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, and one number.'
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists.' });
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword
      }
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error signing up user:', error);
    res.status(500).json({ error: 'Error signing up user', details: error.message });
  }
});

app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

 
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
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
