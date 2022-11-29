// function to generate a random 6 digit alphanumeric number to be used in short url
const generateRandomString = () => {
  const randomNumber = Math.random();
  const numberInBase36 = randomNumber.toString(36);
  const shortString = numberInBase36.substring(2, 8);
  return shortString;
};

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

// route to display data in urlDatabase object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// route to display all urls from urlDatabase object
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// route to form for user to create new url
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// route to individual url based on id
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id, longURL };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

// receives form submission from '/urls/new' and adds the url to the urlDatabase object with a random id for a key
app.post("/urls", (req, res) => {
  console.log(req.body); 
  const randomKey = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[randomKey] = longURL;
  res.redirect(`/urls/:${randomKey}`); // Respond with redirect to /urls/:id
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
