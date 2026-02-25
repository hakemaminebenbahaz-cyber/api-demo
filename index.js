const express = require('express');
const app = express();
app.use(express.json());

// Base de données simulée
let products = [
  { id: 1, name: 'iPhone 15', category: 'smartphone', price: 999, stock: 99999 },
  { id: 2, name: 'Samsung Galaxy S24', category: 'smartphone', price: 899, stock: 99999 },
  { id: 3, name: 'MacBook Pro', category: 'laptop', price: 2499, stock: 99999 },
  { id: 4, name: 'Dell XPS 15', category: 'laptop', price: 1899, stock: 99999 },
  { id: 5, name: 'Sony WH-1000XM5', category: 'audio', price: 349, stock: 99999 },
  { id: 6, name: 'iPad Pro', category: 'tablet', price: 1099, stock: 99999 },
];

let carts = [];
let orders = [];
let nextOrderId = 1;

// GET - Page d'accueil / liste des produits
app.get('/products', (req, res) => {
  res.json({ success: true, count: products.length, data: products });
});

// GET - Recherche d'un produit
app.get('/products/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ success: true, data: products });
  const results = products.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.category.toLowerCase().includes(q.toLowerCase())
  );
  res.json({ success: true, count: results.length, data: results });
});

// GET - Fiche produit
app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ success: false, message: 'Produit non trouvé' });
  res.json({ success: true, data: product });
});

// POST - Ajouter au panier
app.post('/cart', (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || !quantity) {
    return res.status(400).json({ success: false, message: 'productId et quantity requis' });
  }
  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ success: false, message: 'Produit non trouvé' });
  if (product.stock < quantity) {
    return res.status(400).json({ success: false, message: 'Stock insuffisant' });
  }
  const cartItem = { productId, quantity, price: product.price, total: product.price * quantity };
  carts.push(cartItem);
  res.status(201).json({ success: true, data: cartItem });
});

// POST - Passer commande
app.post('/orders', (req, res) => {
  const { productId, quantity, userEmail } = req.body;
  if (!productId || !quantity || !userEmail) {
    return res.status(400).json({ success: false, message: 'productId, quantity et userEmail requis' });
  }
  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ success: false, message: 'Produit non trouvé' });
  if (product.stock < quantity) {
    return res.status(400).json({ success: false, message: 'Stock insuffisant' });
  }
  product.stock -= quantity;
  const order = {
    id: nextOrderId++,
    userEmail,
    productId,
    quantity,
    total: product.price * quantity,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  res.status(201).json({ success: true, data: order });
});

// GET - Santé de l'API
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), orders: orders.length });
});

app.listen(3000, () => {
  console.log('API E-commerce démarrée sur http://localhost:3000');
});