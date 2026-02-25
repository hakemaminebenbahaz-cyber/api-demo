import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '30s', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

function visiteur() {
  const accueil = http.get('https://jsonplaceholder.typicode.com/posts');
  check(accueil, { 'accueil status 200': (r) => r.status === 200 });
  sleep(1);

  const recherche = http.get('https://jsonplaceholder.typicode.com/posts?userId=1');
  check(recherche, { 'recherche status 200': (r) => r.status === 200 });
  sleep(1);

  const produit = http.get('https://jsonplaceholder.typicode.com/posts/1');
  check(produit, { 'fiche produit status 200': (r) => r.status === 200 });
  sleep(1);
}

function acheteur() {
  const accueil = http.get('https://jsonplaceholder.typicode.com/posts');
  check(accueil, { 'accueil status 200': (r) => r.status === 200 });
  sleep(1);

  const recherche = http.get('https://jsonplaceholder.typicode.com/posts?userId=2');
  check(recherche, { 'recherche status 200': (r) => r.status === 200 });
  sleep(1);

  const produit = http.get('https://jsonplaceholder.typicode.com/posts/2');
  check(produit, { 'fiche produit status 200': (r) => r.status === 200 });
  sleep(1);

  const headers = { 'Content-Type': 'application/json' };
  const panier = http.post('https://jsonplaceholder.typicode.com/posts',
    JSON.stringify({ title: 'produit', body: 'ajout panier', userId: 1 }),
    { headers }
  );
  check(panier, { 'ajout panier status 201': (r) => r.status === 201 });
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