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


function validateUserData(userData) {
  const { name, age, gender, dob, height, weight, bmi, goal, injuries } = userData;
  const errors = [];
  
  if (!name || typeof name !== 'string' || name.length < 2) errors.push('Invalid name');
  if (!age || isNaN(age) || age <= 0) errors.push('Invalid age');
  if (!gender || !['male', 'female', 'other'].includes(gender.toLowerCase())) errors.push('Invalid gender');
  if (!dob || isNaN(Date.parse(dob))) errors.push('Invalid date of birth');
  if (!height || isNaN(height) || height <= 0) errors.push('Invalid height');
  if (!weight || isNaN(weight) || weight <= 0) errors.push('Invalid weight');
  if (!bmi || isNaN(bmi) || bmi <= 0) errors.push('Invalid BMI');
  if (!goal || typeof goal !== 'string') errors.push('Invalid goal');
  
  return errors;
}

app.post("/home", async (req, res) => {
  try {        
    const { name, age, gender, dob, height, weight, bmi, goal, injuries } = req.body;
    
  
    const errors = validateUserData(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const user = await prisma.user.create({
      data: {
        name,
        age: parseInt(age),  
        gender,
        dob: new Date(dob),  
        height: parseFloat(height), 
        weight: parseFloat(weight), 
        bmi: parseFloat(bmi), 
        goal,
        injuries
      }
    });

    return res.status(201).json(user); // Success
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post('/signup', async (req, res) => {
  const { email, password} = req.body;


  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  if (!password || !passwordRegex.test(password)) {
    return res.status(400).json({
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
        password: hashedPassword,
       
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

  if (!password) {
    return res.status(400).json({ error: 'Password is required.' });
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
