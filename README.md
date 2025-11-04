## Progetto Ristoranti (ProgettoITS)

Applicazione web per cercare ristoranti in base a preferenze alimentari e restrizioni dietetiche. L'obiettivo del progetto è offrire una ricerca filtrata, gestione delle preferenze e una semplice interfaccia per la registrazione/login degli utenti.

### Funzionalità principali

- Autenticazione utenti (registrazione e login)
- Ricerca ristoranti con filtri (tipo, città, allergie/ingredienti da escludere)
- Salvataggio preferenze e preferiti per utente
- Pagina contatti per inviare messaggi al team

### Tecnologie

- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js + Express
- Database: MongoDB (Atlas o locale)
- Sicurezza: hashing password (es. bcrypt), CORS per le richieste

### Dipendenze

Le dipendenze sono gestite in `package.json`. Per installare le dipendenze locali, esegui:

```powershell
npm install
```

### Installazione e avvio

1. Clona il repository:

```powershell
git clone https://github.com/YunesAzzouz/ProgettoITS.git
cd ProgettoITS
```

2. Installa le dipendenze:

```powershell
npm install
```

3. Avvia l'applicazione:

```powershell
npm start
```

Per impostazione predefinita il server dovrebbe essere disponibile su `http://localhost:3000` (verifica il valore di porta in `server.js`).

### Struttura del progetto (sintesi)

```
ProgettoITS/
├── package.json
├── package-lock.json
├── server.js
├── README.md
├── node_modules/
└── front-end/
    ├── index.html
    ├── login.html
    ├── registrati.html
    ├── API.html
    ├── contact.html
    ├── scelta.html
    ├── preferiti.html
    ├── scripts/
    └── style/
```

### Autori

- YunesAzzouz (repository principale)
- Giorgia Settimi
- Simone Cerqueti
- Manuel Murru
- Emanuele Profili