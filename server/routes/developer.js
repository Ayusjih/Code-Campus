const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Simple developer credentials (no database dependency)
const DEVELOPER_CREDENTIALS = {
  email: "developer@codecampus.com",
  password: "dev123"
};

// Developer data storage (in memory)
let developerData = {
  education: [
    {
      institution: "Madhav Institute of Technology & Science, Gwalior",
      degree: "B.Tech in Information Technology",
      duration: "Aug 2023 - Jun 2027",
      cgpa: "7.5/10",
      enrollment: "090517231028",
      department: "Information Technology"
    }
  ],
  projects: [
    {
      title: "ITM GOI Platform",
      description: "Complete web platform development with user authentication and contest management features.",
      category: "Full Stack",
      link: "#"
    },
    {
      title: "MERN Stack Applications",
      description: "Multiple projects using MERN stack focusing on modern web technologies and scalable architectures.",
      category: "Web Development",
      link: "#"
    }
  ],
  achievements: [
    "Solely created this entire platform from scratch",
    "Active participant in various coding competitions",
    "Consistently maintaining good academic performance (CGPA: 7.5)",
    "Developing practical web development skills alongside academics"
  ],
  guidance: [
    {
      source: "ITM Faculty/Mentors",
      description: "Guidance and Support"
    }
  ]
};

// Developer login (no database check)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Developer login attempt:', email);

    // Simple credential check
    if (email === DEVELOPER_CREDENTIALS.email && password === DEVELOPER_CREDENTIALS.password) {
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: 1, 
          email: DEVELOPER_CREDENTIALS.email, 
          role: 'developer' 
        },
        process.env.JWT_SECRET || 'developer_secret_key_2024',
        { expiresIn: '24h' }
      );

      console.log('✅ Developer login successful');
      
      return res.json({
        message: 'Developer login successful',
        token,
        user: {
          id: 1,
          email: DEVELOPER_CREDENTIALS.email,
          role: 'developer',
          name: 'CodeCampus Developer'
        }
      });
    }

    console.log('❌ Invalid developer credentials');
    return res.status(401).json({ message: 'Invalid credentials' });
    
  } catch (error) {
    console.error('💥 Developer login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Middleware to verify developer token
const verifyDeveloper = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'developer_secret_key_2024');
    req.developer = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get developer data (public endpoint)
router.get('/data', (req, res) => {
  console.log('📄 Serving developer data');
  res.json(developerData);
});

// Update developer data (protected)
router.put('/data', verifyDeveloper, (req, res) => {
  try {
    const { section, data } = req.body;
    
    if (!['education', 'projects', 'achievements', 'guidance'].includes(section)) {
      return res.status(400).json({ message: 'Invalid section' });
    }

    developerData[section] = data;
    console.log('✅ Developer data updated:', section);
    
    res.json({ message: 'Developer data updated successfully', data: developerData[section] });
  } catch (error) {
    console.error('💥 Error updating developer data:', error);
    res.status(500).json({ message: 'Error updating data', error: error.message });
  }
});

// Add new item to section (protected)
router.post('/data/:section', verifyDeveloper, (req, res) => {
  try {
    const { section } = req.params;
    const newItem = req.body;

    if (!['education', 'projects', 'achievements', 'guidance'].includes(section)) {
      return res.status(400).json({ message: 'Invalid section' });
    }

    if (section === 'achievements' && newItem.text) {
      developerData.achievements.push(newItem.text);
    } else {
      developerData[section].push(newItem);
    }

    console.log('✅ Item added to:', section);
    res.json({ message: 'Item added successfully', data: developerData[section] });
  } catch (error) {
    console.error('💥 Error adding item:', error);
    res.status(500).json({ message: 'Error adding item', error: error.message });
  }
});

// Delete item from section (protected)
router.delete('/data/:section/:index', verifyDeveloper, (req, res) => {
  try {
    const { section, index } = req.params;

    if (!['education', 'projects', 'achievements', 'guidance'].includes(section)) {
      return res.status(400).json({ message: 'Invalid section' });
    }

    const itemIndex = parseInt(index);
    if (itemIndex < 0 || itemIndex >= developerData[section].length) {
      return res.status(400).json({ message: 'Invalid index' });
    }

    developerData[section].splice(itemIndex, 1);
    console.log('🗑️ Item deleted from:', section);
    
    res.json({ message: 'Item deleted successfully', data: developerData[section] });
  } catch (error) {
    console.error('💥 Error deleting item:', error);
    res.status(500).json({ message: 'Error deleting item', error: error.message });
  }
});

module.exports = router;