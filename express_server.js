// Edge cases to consider: 
// What would happen if a client requests a short URL with a non-existant id?
// What happens to the urlDatabase when the server is restarted?
// What type of status code do our redirects have? What does this status code mean?


// function to generate a random 6 digit alphanumeric number to be used in short url
const generateRandomString = () => {
  const randomNumber = Math.random();
  const numberInBase36 = randomNumber.toString(36);
  const shortString = numberInBase36.substring(2, 8);
  return shortString;
};

const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));


const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};


// route to home page
app.get('/', (req, res) => {
  res.send('Hello!');
});


// route displays only the text Hello World
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});


// route displays data in urlDatabase object
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});


// route displays all urls from urlDatabase object
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});


// routes to form for user to create new url
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});


// routes to short url page based on id
app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id, longURL };
  res.render('urls_show', templateVars);
});


// receives form submission from '/urls/new', adds the url to the urlDatabase object with a random id for a key, then redirects to long url if user clicks on the hyperlinked key
app.post('/urls', (req, res) => {
  console.log(req.body); 
  const randomKey = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[randomKey] = longURL; // gets removed when server is restarted
  res.redirect(`/urls/${randomKey}`); // responds with redirect to /urls/:id
});


// redirects to long url
app.get('/u/:id', (req, res) => {
  console.log(req)
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
