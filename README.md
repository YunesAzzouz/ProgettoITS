# Progetto Ristoranti - ProgettoITS

Un'applicazione web per la ricerca di ristoranti che permette agli utenti di trovare ristoranti in base alle loro preferenze alimentari e restrizioni dietetiche.

## Funzionalità

-  **Autenticazione Utente**
  - Registrazione nuovo utente
  - Login utenti esistenti
  - Gestione sicura delle password con bcrypt

-  **Ricerca Ristoranti**
  - Filtro per tipo di ristorante
  - Gestione delle allergie e restrizioni alimentari
  - Visualizzazione dettagli ristorante (nome, indirizzo, città)

-  **Gestione Preferenze**
  - Salvataggio preferenze utente
  - Filtri per allergie
  - Personalizzazione ricerca

-  **Contatti**
  - Form di contatto
  - Invio messaggi al supporto

##  Tecnologie Utilizzate

- **Frontend**:
  - HTML5
  - CSS3
  - JavaScript

- **Backend**:
  - Node.js
  - Express.js
  - MongoDB

- **Sicurezza**:
  - bcrypt per l'hashing delle password
  - CORS per la sicurezza delle richieste

##  Dipendenze

- express: ^5.1.0
- mongodb: ^6.17.0
- bcrypt: ^6.0.0
- cors: ^2.8.5

##  Installazione

1. Clona il repository:
   ```bash
   git clone https://github.com/YunesAzzouz/ProgettoITS.git
   ```

2. Installa le dipendenze:
   ```bash
   npm install
   ```

3. Avvia il server:
   ```bash
   npm start
   ```

L'applicazione sarà disponibile all'indirizzo `http://localhost:3000`.

##  Struttura del Progetto

```
ProgettoITS/
├── server.js           # Server Express
├── importa.js         # Script di importazione dati
├── Input.js           # Gestione input
├── front-end/
│   ├── index.html     # Pagina principale
│   ├── login.html     # Pagina di login
│   ├── registrati.html # Pagina di registrazione
│   ├── API.html       # Pagina API
│   ├── contact.html   # Pagina contatti
│   ├── scelta.html    # Pagina selezione preferenze
│   ├── scripts/       # Script JavaScript
│   └── style/         # Fogli di stile CSS
```

##  Configurazione Database

Il progetto utilizza MongoDB Atlas come database. Assicurati di configurare correttamente le credenziali nel file `server.js`.

##  Autori

- [YunesAzzouz](https://github.com/YunesAzzouz)
- [GiorgiaSettimi]
- [SimoneCerqueti]
- [ManuelMurru]
- [EmanueleProfili]

## 📄 Licenza

Questo progetto è sotto licenza ISC.
