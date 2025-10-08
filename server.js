const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection URI
const uri = 'mongodb+srv://allievosettimig:ProgettoITS@projectwork.6lruq01.mongodb.net/?retryWrites=true&w=majority&appName=ProjectWork';
const client = new MongoClient(uri);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("ProgettoITS");
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}
connectDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'front-end')));

// Routes
app.post("/register", async (req, res) => {
  const { name, cognome, email, password } = req.body;

  try {
    const collection = db.collection("Utente");
    const existingUser = await collection.findOne({ Email: email });

    if (existingUser) {
      return res.status(400).send("Email già registrata.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      Nome: name,
      Cognome: cognome,
      Email: email,
      Password: hashedPassword
    };

    await collection.insertOne(newUser);
    res.send("Registrazione completata!");
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).send("Errore durante la registrazione.");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const collection = db.collection("Utente");
    const user = await collection.findOne({ Email: email });

    if (!user) {
      return res.status(401).send("Email non registrata.");
    }

    const passwordMatch = await bcrypt.compare(password, user.Password);
    if (!passwordMatch) {
      return res.status(401).send("Password errata.");
    }

    res.send("Login effettuato con successo!");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Errore del server.");
  }
});

app.post("/api/preferences", async (req, res) => {
  const { tipoRistorante, allergie } = req.body;

  try {
    const collection = db.collection("Preferences");
    const newPreference = {
      tipoRistorante,
      allergie: Array.isArray(allergie) ? allergie : [allergie]
    };

    await collection.insertOne(newPreference);
    res.json({ message: "Preferenze salvate con successo." });
  } catch (err) {
    console.error("Error saving preferences:", err);
    res.status(500).json({ error: "Errore durante il salvataggio." });
  }
});

app.get("/api/restaurants", async (req, res) => {
  const { tipo, allergie } = req.query;

  try {
    const tipoInt = parseInt(tipo);
    const allergieArray = Array.isArray(allergie)
      ? allergie.map(Number)
      : allergie
      ? [parseInt(allergie)]
      : [];

    const matchQuery = {};
    if (!isNaN(tipoInt)) matchQuery.FK_Tipo = tipoInt;
    if (allergieArray.length > 0) {
      matchQuery.FK_Filtro = { $not: { $in: allergieArray } };
    }

    const results = await db.collection("Ristoranti").aggregate([
      { $match: matchQuery },

      // Optional normalization in case of string numbers
      {
        $addFields: {
          FK_Tipo: { $toInt: "$FK_Tipo" },
          FK_Filtro: {
            $cond: {
              if: { $isArray: "$FK_Filtro" },
              then: "$FK_Filtro",
              else: [{ $toInt: "$FK_Filtro" }]
            }
          }
        }
      },

      // Joins
      {
        $lookup: {
          from: "TipoRistoranti",
          localField: "FK_Tipo",
          foreignField: "ID",
          as: "TipoRistorante"
        }
      },
      {
        $lookup: {
          from: "Citta",
          localField: "FK_Citta",
          foreignField: "Cap",
          as: "Citta"
        }
      },
      {
        $lookup: {
          from: "Filtro",
          localField: "FK_Filtro",
          foreignField: "ID",
          as: "Filtro"
        }
      },

      // Unwind the one-to-one joins (Tipo, Citta)
      { $unwind: { path: "$TipoRistorante", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$Citta", preserveNullAndEmptyArrays: true } },

      // Group to avoid duplicates from multiple filters
      {
        $group: {
          _id: {
            Nome: "$Nome",
            Indirizzo: "$Indirizzo",
            Tipo: "$TipoRistorante.Nome",
            Citta: "$Citta.Nome"
          },
          Filtri: { $addToSet: "$Filtro.Nome" }
        }
      },
      {
        $project: {
          _id: 0,
          Nome: "$_id.Nome",
          Indirizzo: "$_id.Indirizzo",
          Tipo: "$_id.Tipo",
          Citta: "$_id.Citta",
          Filtri: 1
        }
      }
    ]).toArray();

    res.json(results);
  } catch (err) {
    console.error("Error fetching restaurants:", err);
    res.status(500).json({ error: "Errore durante la ricerca." });
  }
});


// Start server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});