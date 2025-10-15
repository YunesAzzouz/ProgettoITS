const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");

const uri = 'mongodb+srv://allievosettimig:ProgettoITS@projectwork.6lruq01.mongodb.net/?retryWrites=true&w=majority&appName=ProjectWork';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connesso a MongoDB");

    const database = client.db("ProgettoITS");
    const collection = database.collection("Utente");

    const plainPassword = "securepassword123";
    const saltRounds = 10;

    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
      console.log("Hashing riuscito:");
    } catch (err) {
      console.error("Hashing fallito:", err);
      return;
    }

    const newUser = {
      Nome: "Mario",
      Cognome: "Rossi",
      Email: "mario.rossi@example.com",
      Password: hashedPassword
    };

    const result = await collection.insertOne(newUser);

    if (result.acknowledged) {
      console.log(`Utente aggiunto con id: ${result.insertedId}`);
    } else {
      console.log("Inserimento non riuscito");
    }

  } catch (err) {
    console.error("Errore", err);
  } finally {
    await client.close();
    console.log("Connessione al database chiusa");
  }
}

run().catch(console.dir)