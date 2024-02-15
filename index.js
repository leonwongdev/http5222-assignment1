const express = require("express");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

// // Set up MongoClient
// const connectionString =
//   "mongodb://torentaluser:torental123@localhost:27017/?authSource=torental";
const connectionString = "mongodb+srv://http5222:6BCAu21ncYG8xKrS@cluster0.wrflv78.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(connectionString);

// Set up Express server
const app = express();
const port = process.env.PORT || 3000;
// Set Pug as the view engine
app.set("view engine", "pug");
// Set the views directory
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

// Set up for easier form data parsing
// Convert query string to object
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get("/", async (req, res) => {
  // renders home page
  // let links = await getLinks();

  res.render("index");
});

// A route to render the about page
app.get("/about", (req, res) => {
  res.render("about");
});

// A route to render the rental listings page
app.get("/listings", async (req, res) => {
  try {
    // use the getRentals function to get the rental listings
    let rentalListings = await getRentals();
    res.render("listings", { rentals: rentalListings });
  } catch (error) {
    console.error("Error retrieving rental listings:", error);
    res.status(500).send("Internal Server Error");
  }
});

// A route to render the add rental listing page
app.get("/listings/add", (req, res) => {
  res.render("add-rental");
});

// A route to handle the form submission for adding a rental listing
app.post("/listings/add", async (req, res) => {
  try {
    // use the addRental function to add the rental listing to the database
    await addRental(req.body);
    res.redirect("/listings");
  } catch (error) {
    console.error("Error adding rental listing:", error);
    res.status(500).send("Internal Server Error");
  }
});

// A route to render the edit rental listing page
app.get("/listings/edit/:id", async (req, res) => {
  try {
    // use the getSingleLink function to get the rental listing to edit
    let rentalListing = await getSingleRental(req.params.id);
    res.render("edit-rental", { rental: rentalListing });
  } catch (error) {
    console.error("Error retrieving rental listing:", error);
    res.status(500).send("Internal Server Error");
  }
});

// A route to handle the form submission for editing a rental listing
app.post("/listings/edit/:id", async (req, res) => {
  try {
    // use the editRental function to update the rental listing in the database
    await editRental({ _id: new ObjectId(req.params.id) }, req.body);
    res.redirect("/listings");
  } catch (error) {
    console.error("Error editing rental listing:", error);
    res.status(500).send("Internal Server Error");
  }
});

// A route to handle the form submission for deleting a rental listing
app.get("/listings/delete/:id", async (req, res) => {
  try {
    // use the deleteRental function to delete the rental listing from the database
    await deleteRental(req.params.id);
    res.redirect("/listings");
  } catch (error) {
    console.error("Error deleting rental listing:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}`);
});

// Helper function for MongoDB
async function connection() {
  // If you leave the argument blank,
  // it will find the default db from the connection string
  const db = client.db("torental");
  return db;
}

// function get get all the listing from mongodb's listings collection
async function getRentals() {
  const db = await connection();
  let results = db.collection("listings").find({});

  let res = await results.toArray();

  return res;
}

// function to get a single rental listing from the mongodb's listings collection
async function getSingleRental(id) {
  const db = await connection();
  const editId = { _id: new ObjectId(id) };
  const result = await db.collection("listings").findOne(editId);
  return result;
}

// function to add a new rental listing to the mongodb's listings collection
async function addRental(rentalData) {
  const db = await connection();
  let status = await db.collection("listings").insertOne(rentalData);
}

// function to update a rental listing in the mongodb's listings collection
async function editRental(idFilter, rentalData) {
  const db = await connection();
  const result = await db.collection("listings").updateOne(idFilter, {
    $set: rentalData,
  });
  console.log("editRental result", result);
}

// function to delete a rental listing from the mongodb's listings collection
async function deleteRental(id) {
  const db = await connection();
  const deleteId = { _id: new ObjectId(id) };
  const result = await db.collection("listings").deleteOne(deleteId);
  if (result.deletedCount == 1) console.log("deleteRental: delete successful");
}