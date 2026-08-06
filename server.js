const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5173; 

const JWT_SECRET = 'LUNARY_SECRET_KEY_2026';

app.use(cors());
app.use(express.json());
// Serve static files
app.use(express.static(path.join(__dirname)));

const dataPath = path.join(__dirname, 'data');

// --- MIDDLEWARES ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Yetkisiz erişim' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Geçersiz token' });
    req.user = user; // { id, name, email, role }
    next();
  });
};

// --- API ROUTES ---

// GET Products
app.get('/api/products', (req, res) => {
  try {
    const data = fs.readFileSync(path.join(dataPath, 'products.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Veri okunamadı' });
  }
});

// ADD Product
app.post('/api/products', (req, res) => {
  try {
    const file = path.join(dataPath, 'products.json');
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const newProduct = {
      id: 'p' + Date.now(),
      ...req.body
    };
    data.unshift(newProduct); // Add to beginning
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    res.json(newProduct);
  } catch (err) {
    res.status(500).json({ error: 'Kaydedilemedi' });
  }
});

// UPDATE Product
app.put('/api/products/:id', (req, res) => {
  try {
    const file = path.join(dataPath, 'products.json');
    let data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const index = data.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
      data[index] = { ...data[index], ...req.body };
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
      res.json(data[index]);
    } else {
      res.status(404).json({ error: 'Ürün bulunamadı' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Güncellenemedi' });
  }
});

// DELETE Product
app.delete('/api/products/:id', (req, res) => {
  try {
    const file = path.join(dataPath, 'products.json');
    let data = JSON.parse(fs.readFileSync(file, 'utf8'));
    data = data.filter(p => p.id !== req.params.id);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Silinemedi' });
  }
});

// GET Blogs
app.get('/api/blogs', (req, res) => {
  try {
    const data = fs.readFileSync(path.join(dataPath, 'blogs.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Veri okunamadı' });
  }
});

// ADD Blog
app.post('/api/blogs', (req, res) => {
  try {
    const file = path.join(dataPath, 'blogs.json');
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const newBlog = {
      id: 'b' + Date.now(),
      date: new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }),
      ...req.body
    };
    data.unshift(newBlog);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    res.json(newBlog);
  } catch (err) {
    res.status(500).json({ error: 'Kaydedilemedi' });
  }
});

// DELETE Blog
app.delete('/api/blogs/:id', (req, res) => {
  try {
    const file = path.join(dataPath, 'blogs.json');
    let data = JSON.parse(fs.readFileSync(file, 'utf8'));
    data = data.filter(b => b.id !== req.params.id);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Silinemedi' });
  }
});

// --- AUTH ROUTES ---
// REGISTER
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const file = path.join(dataPath, 'users.json');
    const users = JSON.parse(fs.readFileSync(file, 'utf8'));

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Bu e-posta zaten kayıtlı.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: 'u' + Date.now(),
      name,
      email,
      password: hashedPassword,
      role: 'customer' // default role
    };

    users.push(newUser);
    fs.writeFileSync(file, JSON.stringify(users, null, 2));

    const token = jwt.sign({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }, JWT_SECRET);
    res.json({ token, user: { id: newUser.id, name: newUser.name, role: newUser.role } });
  } catch (err) {
    res.status(500).json({ error: 'Kayıt oluşturulamadı' });
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const file = path.join(dataPath, 'users.json');
    const users = JSON.parse(fs.readFileSync(file, 'utf8'));

    // Special bypass for admin if empty (first time setup)
    if (email === 'admin1234' && password === 'admin123') {
      let admin = users.find(u => u.email === email);
      if (!admin) {
        admin = { id: 'admin1', name: 'Yönetici', email, password: await bcrypt.hash(password, 10), role: 'admin' };
        users.push(admin);
        fs.writeFileSync(file, JSON.stringify(users, null, 2));
      }
    }

    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ error: 'Kullanıcı bulunamadı.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Hatalı şifre.' });

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Giriş yapılamadı' });
  }
});

// GET ME
app.get('/api/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// --- ORDER ROUTES ---
app.post('/api/orders', authenticateToken, (req, res) => {
  try {
    const file = path.join(dataPath, 'orders.json');
    const orders = JSON.parse(fs.readFileSync(file, 'utf8'));
    
    const newOrder = {
      id: 'ord' + Date.now(),
      userId: req.user.id,
      customerName: req.user.name,
      productId: req.body.productId,
      productTitle: req.body.productTitle,
      variations: req.body.variations, // e.g. { color, material, size, note }
      status: 'Beklemede',
      createdAt: new Date().toISOString()
    };

    orders.unshift(newOrder);
    fs.writeFileSync(file, JSON.stringify(orders, null, 2));
    res.json(newOrder);
  } catch (err) {
    res.status(500).json({ error: 'Sipariş oluşturulamadı' });
  }
});

// GET ORDERS (Admin sees all, User sees their own)
app.get('/api/orders', authenticateToken, (req, res) => {
  try {
    const file = path.join(dataPath, 'orders.json');
    const orders = JSON.parse(fs.readFileSync(file, 'utf8'));
    
    if (req.user.role === 'admin') {
      res.json(orders);
    } else {
      const myOrders = orders.filter(o => o.userId === req.user.id);
      res.json(myOrders);
    }
  } catch (err) {
    res.status(500).json({ error: 'Siparişler okunamadı' });
  }
});

app.put('/api/orders/:id/status', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Yetkisiz' });
    const file = path.join(dataPath, 'orders.json');
    const orders = JSON.parse(fs.readFileSync(file, 'utf8'));
    const order = orders.find(o => o.id === req.params.id);
    if (order) {
      order.status = req.body.status;
      fs.writeFileSync(file, JSON.stringify(orders, null, 2));
      res.json(order);
    } else {
      res.status(404).json({ error: 'Bulunamadı' });
    }
  } catch(err) {
    res.status(500).json({ error: 'Hata' });
  }
});

// --- MESSAGE ROUTES ---
app.post('/api/messages', authenticateToken, (req, res) => {
  try {
    const file = path.join(dataPath, 'messages.json');
    const messages = JSON.parse(fs.readFileSync(file, 'utf8'));
    
    const newMsg = {
      id: 'm' + Date.now(),
      orderId: req.body.orderId,
      senderId: req.user.id,
      senderName: req.user.name,
      senderRole: req.user.role,
      text: req.body.text,
      createdAt: new Date().toISOString()
    };

    messages.push(newMsg);
    fs.writeFileSync(file, JSON.stringify(messages, null, 2));
    res.json(newMsg);
  } catch (err) {
    res.status(500).json({ error: 'Mesaj gönderilemedi' });
  }
});

app.get('/api/messages/:orderId', authenticateToken, (req, res) => {
  try {
    const file = path.join(dataPath, 'messages.json');
    const messages = JSON.parse(fs.readFileSync(file, 'utf8'));
    const orderMessages = messages.filter(m => m.orderId === req.params.orderId);
    res.json(orderMessages);
  } catch (err) {
    res.status(500).json({ error: 'Mesajlar okunamadı' });
  }
});

// Fallback for SPA or generic routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
