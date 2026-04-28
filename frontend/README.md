# Sportify Pro - Frontend

Interface web React + Vite + Tailwind CSS, qui consomme l'API REST.

## Lancement local

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:4000/api" > .env
npm run dev
```

Frontend sur http://localhost:5173.

## Pages

- `/login` - connexion
- `/register` - inscription (rôle CLIENT par défaut)
- `/seances` - liste des séances + réservation (CLIENT)
- `/mes-reservations` - réservations du client courant
- `/coach` - planning, création / suppression de séances, liste des participants
- `/admin` - dashboard administrateur (utilisateurs + séances)

## Build production

```bash
npm run build
npm run preview
```
