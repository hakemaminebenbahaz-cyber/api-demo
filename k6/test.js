import http from 'k6/http';
import { sleep, check } from 'k6';

const BASE_URL = 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // monter a 10 utilisateurs
    { duration: '30s', target: 50 },  // monter a 50 utilisateurs
    { duration: '30s', target: 0 },   // redescente a 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% des requêtes doivent être inférieures à 200ms
    http_req_failed: ['rate<0.01'],//il faut que moins de 1% des requêtes échouent
  },
};


function visiteur() {

  const accueil = http.get(`${BASE_URL}/products`);
  check(accueil, { 'accueil status 200': (r) => r.status === 200 });
  sleep(1);

  
  const recherche = http.get(`${BASE_URL}/products/search?q=smartphone`);
  check(recherche, { 'recherche status 200': (r) => r.status === 200 });
  sleep(1);

  
  const produit = http.get(`${BASE_URL}/products/1`);
  check(produit, { 'fiche produit status 200': (r) => r.status === 200 });
  sleep(1);
}

function acheteur() {
  const accueil = http.get(`${BASE_URL}/products`);
  check(accueil, { 'accueil status 200': (r) => r.status === 200 });
  sleep(1);

  const recherche = http.get(`${BASE_URL}/products/search?q=laptop`);
  check(recherche, { 'recherche status 200': (r) => r.status === 200 });
  sleep(1);

  const produitId = Math.floor(Math.random() * 6) + 1;
  const produit = http.get(`${BASE_URL}/products/${produitId}`);
  check(produit, { 'fiche produit status 200': (r) => r.status === 200 });
  sleep(1);

  const headers = { 'Content-Type': 'application/json' };
  const panier = http.post(`${BASE_URL}/cart`, JSON.stringify({
    productId: produitId,
    quantity: 1,
  }), { headers });
  check(panier, { 'ajout panier status 201': (r) => r.status === 201 });
  sleep(1);

  const commande = http.post(`${BASE_URL}/orders`, JSON.stringify({
    productId: produitId,
    quantity: 1,
    userEmail: `user_${Math.random().toString(36).substring(7)}@mail.com`,
  }), { headers });
  check(commande, { 'commande status 201': (r) => r.status === 201 });
  sleep(1);
}

export default function () {
  const random = Math.random();
  if (random < 0.8) {
    visiteur();
  } else {
    acheteur();
  }
}