const express = require("express");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🔹 Servi tutti i file statici dal front-end
// In questo modo http://localhost:3000/index.html funziona correttamente
app.use(express.static(path.join(__dirname, "front-end")));

// MongoDB connection
const uri =
  "mongodb+srv://allievosettimig:ProgettoITS@projectwork.6lruq01.mongodb.net/?retryWrites=true&w=majority&appName=ProjectWork";
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


// ==================== ROUTES ====================

// 🔹 Registrazione
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
      Password: hashedPassword,
    };

    await collection.insertOne(newUser);
    res.send("Registrazione completata!");
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).send("Errore durante la registrazione.");
  }
});


// 🔹 Login
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

    // Reindirizza alla home (index.html dentro front-end)
    res.redirect("/index.html");

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Errore del server.");
  }
});


// Salvataggio preferenze
app.post("/api/preferences", async (req, res) => {
  const { tipoRistorante, allergie } = req.body;

  try {
    const collection = db.collection("Preferences");
    const newPreference = {
      tipoRistorante,
      allergie: Array.isArray(allergie) ? allergie : [allergie],
    };

    await collection.insertOne(newPreference);
    res.json({ message: "Preferenze salvate con successo." });
  } catch (err) {
    console.error("Error saving preferences:", err);
    res.status(500).json({ error: "Errore durante il salvataggio." });
  }
});


// Ricerca ristoranti
app.get("/api/restaurants", async (req, res) => {
  const { tipo, allergie, citta } = req.query;

  try {
    const tipoInt = parseInt(tipo);
    const allergieArray = Array.isArray(allergie)
      ? allergie.map(Number)
      : allergie
      ? [parseInt(allergie)]
      : [];

    console.log("🔍 Filtri ricevuti dal client:", {
      tipo: tipoInt || null,
      citta: citta || null,
      allergie: allergieArray
    });

    const pipeline = [
      // --- Convert FK_Tipo to int, FK_Filtro to int array, keep FK_Citta as string ---
      {
        $addFields: {
          FK_Tipo: { $toInt: "$FK_Tipo" },
          FK_Filtro: {
            $cond: {
              if: { $isArray: "$FK_Filtro" },
              then: { $map: { input: "$FK_Filtro", as: "f", in: { $toInt: "$$f" } } },
              else: {
                $map: {
                  input: { $split: [{ $toString: "$FK_Filtro" }, ","] },
                  as: "f",
                  in: {
                    $convert: { input: { $trim: { input: "$$f" } }, to: "int", onError: null, onNull: null }
                  }
                }
              }
            }
          }
        }
      },
      // --- Match filters ---
      {
        $match: {
          ...(tipoInt && !isNaN(tipoInt) ? { FK_Tipo: tipoInt } : {}),
          ...(citta ? { FK_Citta: citta } : {}),
          ...(allergieArray.length > 0 ? { FK_Filtro: { $nin: allergieArray } } : {})
        }
      },
      // --- Lookups ---
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
      // --- Unwind for lookups ---
      { $unwind: { path: "$TipoRistorante", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$Citta", preserveNullAndEmptyArrays: true } },
      // --- Group to consolidate multiple filters ---
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
      // --- Project final shape ---
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
    ];

    const results = await db.collection("Ristoranti").aggregate(pipeline).toArray();

    console.log(`📦 Trovati ${results.length} ristoranti`);
    if (results.length > 0) console.log("📋 Esempio risultati:", results.slice(0, 3));

    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching restaurants:", err);
    res.status(500).json({ error: "Errore durante la ricerca." });
  }
});


// Messaggi contatti
app.post("/api/contact", async (req, res) => {
  const { email, messaggio } = req.body;

  if (!email || !messaggio) {
    return res.status(400).json({ error: "Email e messaggio sono obbligatori." });
  }

  try {
    const collection = db.collection("Messaggi");
    const newMessage = {
      email,
      contenuto: messaggio,
      createdAt: new Date(),
    };
    await collection.insertOne(newMessage);
    res.json({ message: "Messaggio inviato con successo!" });
  } catch (err) {
    console.error("Errore durante l'invio del messaggio:", err);
    res.status(500).json({ error: "Errore del server." });
  }
});


// Aggiungi ai preferiti
app.post("/api/favorites/add", async (req, res) => {
  const { email, restaurantName } = req.body;

  if (!email || !restaurantName) {
    return res.status(400).json({ error: "Email e nome ristorante sono obbligatori." });
  }

  try {
    const collection = db.collection("Favorites");
    await collection.updateOne(
      { email },
      { $addToSet: { restaurants: restaurantName } },
      { upsert: true }
    );
    res.json({ message: `Ristorante "${restaurantName}" aggiunto ai preferiti!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore durante il salvataggio del preferito." });
  }
});


// Rimuovi dai preferiti
app.post("/api/favorites/remove", async (req, res) => {
  const { email, restaurantName } = req.body;

  if (!email || !restaurantName) {
    return res.status(400).json({ error: "Email e nome ristorante sono obbligatori." });
  }

  try {
    const collection = db.collection("Favorites");
    await collection.updateOne({ email }, { $pull: { restaurants: restaurantName } });
    res.json({ message: `Ristorante "${restaurantName}" rimosso dai preferiti.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore durante la rimozione del preferito." });
  }
});


// Ottieni preferiti
app.get("/api/favorites", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email obbligatoria." });
  }

  try {
    const collection = db.collection("Favorites");
    const doc = await collection.findOne({ email });

    if (!doc || !doc.restaurants || doc.restaurants.length === 0) {
      return res.json([]);
    }

    const restaurants = await db
      .collection("Ristoranti")
      .find({ Nome: { $in: doc.restaurants } })
      .toArray();

    res.json(restaurants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore durante il recupero dei preferiti." });
  }
});


// ==================== AVVIO SERVER ====================
app.listen(port, () => {
  console.log(`Server avviato su http://localhost:${port}`);
});
