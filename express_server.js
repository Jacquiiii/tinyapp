/*---------------------------------TinyApp-------------------------------------*/

const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/*-----------------------------------------------------------------------------*/

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

/*-----------------------------------------------------------------------------*/

// Generates a random 6 digit alphanumeric number to be used in short url
const generateRandomString = () => {
  const randomNumber = Math.random();
  const numberInBase36 = randomNumber.toString(36);
  const shortString = numberInBase36.substring(2, 8);
  return shortString;
};

/*-----------------------------------------------------------------------------*/

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
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render('urls_index', templateVars);
});


// routes to form for user to create new url
app.get('/urls/new', (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
  };
  res.render('urls_new', templateVars);
});


// routes to short url page based on id
app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { 
    id, 
    longURL,
    username: req.cookies["username"]
  };

  // redirects to error page if id is invalid
  if (!longURL) {
    res.redirect('/404');
  }
  res.render('urls_show', templateVars);
});


// receives form submission from '/urls/new', adds the url to the urlDatabase object with a random id for a key, then redirects to long url if user clicks on the hyperlinked key
app.post('/urls', (req, res) => {
  const randomKey = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[randomKey] = longURL; // gets removed when server is restarted
  res.redirect(`/urls/${randomKey}`); // responds with redirect to /urls/:id
});


// redirects to long url
app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  // redirects to error page if id is invalid
  if (!longURL) {
    res.redirect('/404');
  }

  res.redirect(longURL);
});


// POST route for /urls/:id/delete to remove URLs
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});


// POST route that updates a URL resource
app.post('/urls/:id/update', (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect('/urls');
});


// POST route to handle login
app.post('/login', (req, res) => {
  const usernameCookie = req.body.username;
  res.cookie('username', usernameCookie);
  res.redirect('/urls');
});


// POST route to handle logout
app.post('/logout', (req, res) => {
  const usernameCookie = req.body.username;
  res.clearCookie('username', usernameCookie);
  res.redirect('/urls');
});


// route for client error
app.get('/404', (req, res) => {
  res.render('404')
})

/*-----------------------------------------------------------------------------*/

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

/*-----------------------------------------------------------------------------*/