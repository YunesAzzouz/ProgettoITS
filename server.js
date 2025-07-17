const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");

const app = express();
const port = 3000;

// MongoDB connection URI
const uri = 'mongodb+srv://allievosettimig:ProgettoITS@projectwork.6lruq01.mongodb.net/?retryWrites=true&w=majority&appName=ProjectWork';
const client = new MongoClient(uri);

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'front-end')));

// Route to handle form submission
app.post("/register", async (req, res) => {
  const { name, cognome, email, password } = req.body;

  try {
    await client.connect();
    const database = client.db("ProgettoITS");
    const collection = database.collection("Utente");

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user document
    const newUser = {
      Nome: name,
      Cognome: cognome,
      Email: email,
      Password: hashedPassword
    };

    // Insert into database
    const result = await collection.insertOne(newUser);
    console.log(`User inserted with _id: ${result.insertedId}`);

    res.send("Registrazione completata!");
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).send("Errore durante la registrazione.");
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
