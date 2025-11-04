const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "front-end")));

const uri = "mongodb+srv://allievosettimig:ProgettoITS@projectwork.6lruq01.mongodb.net/?retryWrites=true&w=majority&appName=ProjectWork";
const client = new MongoClient(uri);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("ProgettoITS");
    console.log("MongoDB connesso");
  } catch (err) {
    console.error("Errore MongoDB:", err);
  }
}
connectDB();

app.post("/register", async (req, res) => {
  const { name, cognome, email, password } = req.body;
  try {
    const collection = db.collection("Utente");
    const existingUser = await collection.findOne({ Email: email });
    if (existingUser) return res.status(400).json({ error: "Email già registrata." });
    const hashedPassword = await bcrypt.hash(password, 10);
    await collection.insertOne({ Nome: name, Cognome: cognome, Email: email, Password: hashedPassword });
    res.json({ message: "Registrazione completata!" });
  } catch {
    res.status(500).json({ error: "Errore durante la registrazione." });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const collection = db.collection("Utente");
    const user = await collection.findOne({ Email: email });
    if (!user) return res.status(401).json({ error: "Email non registrata." });
    const passwordMatch = await bcrypt.compare(password, user.Password);
    if (!passwordMatch) return res.status(401).json({ error: "Password errata." });
    res.json({ message: "Login effettuato con successo!", email: user.Email });
  } catch {
    res.status(500).json({ error: "Errore del server." });
  }
});

app.post("/api/preferences", async (req, res) => {
  const { tipoRistorante, allergie } = req.body;
  try {
    const collection = db.collection("Preferences");
    await collection.insertOne({
      tipoRistorante,
      allergie: Array.isArray(allergie) ? allergie : [allergie],
    });
    res.json({ message: "Preferenze salvate con successo." });
  } catch {
    res.status(500).json({ error: "Errore durante il salvataggio." });
  }
});

app.get("/api/restaurants", async (req, res) => {
  const { tipo, allergie, citta } = req.query;
  try {
    const tipoInt = parseInt(tipo);
    const allergieArray = Array.isArray(allergie)
      ? allergie.map(Number)
      : allergie
      ? [parseInt(allergie)]
      : [];

    const pipeline = [
      {
        $addFields: {
          FK_Tipo: { $toInt: "$FK_Tipo" },
          FK_Filtro: {
            $cond: {
              if: { $isArray: "$FK_Filtro" },
              then: {
                $map: { input: "$FK_Filtro", as: "f", in: { $toInt: "$$f" } },
              },
              else: {
                $map: {
                  input: { $split: [{ $toString: "$FK_Filtro" }, ","] },
                  as: "f",
                  in: {
                    $convert: {
                      input: { $trim: { input: "$$f" } },
                      to: "int",
                      onError: null,
                      onNull: null,
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $match: {
          ...(tipoInt && !isNaN(tipoInt) ? { FK_Tipo: tipoInt } : {}),
          ...(citta ? { FK_Citta: citta } : {}),
          ...(allergieArray.length > 0 ? { FK_Filtro: { $nin: allergieArray } } : {}),
        },
      },
      {
        $lookup: {
          from: "TipoRistoranti",
          localField: "FK_Tipo",
          foreignField: "ID",
          as: "TipoRistorante",
        },
      },
      {
        $lookup: {
          from: "Citta",
          localField: "FK_Citta",
          foreignField: "Cap",
          as: "Citta",
        },
      },
      {
        $lookup: {
          from: "Filtro",
          localField: "FK_Filtro",
          foreignField: "ID",
          as: "Filtro",
        },
      },
      { $unwind: { path: "$TipoRistorante", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$Citta", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            Nome: "$Nome",
            Indirizzo: "$Indirizzo",
            Tipo: "$TipoRistorante.Nome",
            Citta: "$Citta.Nome",
            telefono: "$telefono",
            url_sito: "$url_sito",
          },
          Filtri: { $addToSet: "$Filtro.Nome" },
        },
      },
      {
        $project: {
          _id: 0,
          Nome: "$_id.Nome",
          Indirizzo: "$_id.Indirizzo",
          Tipo: "$_id.Tipo",
          Citta: "$_id.Citta",
          telefono: "$_id.telefono",
          url_sito: "$_id.url_sito",
          Filtri: 1,
        },
      },
    ];

    const results = await db.collection("Ristoranti").aggregate(pipeline).toArray();
    res.json(results);
  } catch {
    res.status(500).json({ error: "Errore durante la ricerca." });
  }
});

app.post("/api/contact", async (req, res) => {
  const { email, messaggio } = req.body;
  if (!email || !messaggio)
    return res.status(400).json({ error: "Email e messaggio sono obbligatori." });
  try {
    await db.collection("Messaggi").insertOne({
      email,
      contenuto: messaggio,
      createdAt: new Date(),
    });
    res.json({ message: "Messaggio inviato con successo!" });
  } catch {
    res.status(500).json({ error: "Errore del server." });
  }
});

app.post("/api/favorites/add", async (req, res) => {
  const { email, restaurantName } = req.body;
  if (!email || !restaurantName)
    return res.status(400).json({ error: "Email e nome ristorante sono obbligatori." });
  try {
    await db.collection("Favorites").updateOne(
      { email },
      { $addToSet: { restaurants: restaurantName } },
      { upsert: true }
    );
    res.json({ message: `Ristorante "${restaurantName}" aggiunto ai preferiti.` });
  } catch {
    res.status(500).json({ error: "Errore durante il salvataggio del preferito." });
  }
});

app.post("/api/favorites/remove", async (req, res) => {
  const { email, restaurantName } = req.body;
  if (!email || !restaurantName)
    return res.status(400).json({ error: "Email e nome ristorante sono obbligatori." });
  try {
    await db.collection("Favorites").updateOne(
      { email },
      { $pull: { restaurants: restaurantName } }
    );
    res.json({ message: `Ristorante "${restaurantName}" rimosso dai preferiti.` });
  } catch {
    res.status(500).json({ error: "Errore durante la rimozione del preferito." });
  }
});

app.get("/api/favorites", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "Email mancante." });
  try {
    const favDoc = await db.collection("Favorites").findOne({ email });
    if (!favDoc || !favDoc.restaurants?.length) return res.json([]);
    const restaurants = await db
      .collection("Ristoranti")
      .find({ Nome: { $in: favDoc.restaurants } })
      .project({
        _id: 0,
        Nome: 1,
        Indirizzo: 1,
        FK_Tipo: 1,
        FK_Citta: 1,
        telefono: 1,
        url_sito: 1,
      })
      .toArray();

    const tipi = await db.collection("TipoRistoranti").find().toArray();
    const citta = await db.collection("Citta").find().toArray();

    const tipoMap = Object.fromEntries(
      tipi.map((t) => [String(t.ID), t.Nome || t.Tipo || "N/A"])
    );
    const cittaMap = Object.fromEntries(
      citta.map((c) => [String(c.Cap || c.CAP), c.Nome || "N/A"])
    );

    const result = restaurants.map((r) => ({
      Nome: r.Nome,
      Indirizzo: r.Indirizzo,
      Tipo: tipoMap[String(r.FK_Tipo)] || "N/A",
      Citta: cittaMap[String(r.FK_Citta)] || "N/A",
      telefono: r.telefono || "N/A",
      url_sito: r.url_sito?.trim() || "N/A",
    }));

    res.json(result);
  } catch {
    res.status(500).json({ error: "Errore durante il caricamento dei preferiti." });
  }
});

app.listen(port, () => {
  console.log(`Server raggiungibile a http://localhost:${port}`);
});
