/*------------------------------Require code----------------------------------*/


const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


/*----------------------------Database Objects--------------------------------*/


const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


/*----------------------------Helper functions--------------------------------*/


// Generates a random 6 digit alphanumeric number to be used in short url
const generateRandomString = () => {
  const randomNumber = Math.random();
  const numberInBase36 = randomNumber.toString(36);
  const shortString = numberInBase36.substring(2, 8);
  return shortString;
};

// ****Work on this later - from Registration Errors section day 3****
// Function to loop through users object to determine if email exists
// const getUserByEmail = (email) => {}


/*--------------------------------Route code-----------------------------------*/


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


// GET route which renders the urls_index template
// route displays all urls from urlDatabase object
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']],
  };
  res.render('urls_index', templateVars);
});


// GET route which renders the urls_index template
// routes to form for user to create new url
app.get('/urls/new', (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render('urls_new', templateVars);
});


// GET route which renders the urls_show template
// routes to short url page based on unique id
app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = {
    id,
    longURL,
    user: users[req.cookies['user_id']],
  };

  // redirects to error page if id is invalid
  if (!longURL) {
    res.redirect('/404');
  }
  res.render('urls_show', templateVars);
});


// POST route which receives form submission from /urls/new, adds the url to the urlDatabase object with a random id for a key, then redirects to long url if user clicks on the hyperlinked key
app.post('/urls', (req, res) => {
  const randomKey = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[randomKey] = longURL; // gets removed when server is restarted
  res.redirect(`/urls/${randomKey}`); // responds with redirect to /urls/:id
});


// GET route which redirects to long url
app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  // redirects to error page if id is invalid
  if (!longURL) {
    res.redirect('/404');
  }

  res.redirect(longURL);
});


// POST route that deletes a URL
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});


// POST route that edits the long url of an existing entry
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
  const usernameCookie = req.body.id;
  res.clearCookie('user_id', usernameCookie);
  res.redirect('/urls');
});


// GET route which renders the registration template
app.get('/register', (req, res) => {
  const templateVars = { user: null };
  res.render('registration', templateVars);
});


// POST route that handles registration form data
app.post('/register', (req, res) => {
  const randomKey = generateRandomString();
  const username = req.body.email;
  const password = req.body.password;

  // returns error 400 if username or password is no entered
  if (username === '' || password === '') {
    res.status(400).send('Error 400 - Invalid username or password entered');
    console.log(users);
    return;
  }

  // returns error 400 if user already exists
  for (const id in users) {
    if (username === users[id].email) {
      return res.status(400).send('Error 400 - The email entered already exists');
    }
  }

  // creates new user and adds to users object if the above conditions are not met
  users[randomKey] = {
    id: randomKey,
    email: username,
    password: password
  };

  res.cookie('user_id', randomKey);
  res.redirect('/urls');
  console.log(users);
});


// GET route which renders the login template
app.get('/login', (req, res) => {
  const templateVars = { user: null };
  res.render('login', templateVars);
});


// POST route that handles user login
app.post('/login', (req, res) => {
  const username = req.body.email;
  const password = req.body.password;

  for (const id in users) {
    if (username !== users[id].email) {
      return res.status(403).send('Error 403 - The username and/or password entered does not match our records');
    }
    if (password !== users[id].password) {
      return res.status(403).send('Error 403 - The username and/or password entered does not match our records');
    }
  }

  res.cookie('user_id', randomKey); //fix this
  res.redirect('/urls');
});


// GET route for client errors (e.g. unknown id entered)
app.get('/404', (req, res) => {
  res.render('404');
});


/*---------------------------Server connection code----------------------------*/


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


/*-----------------------------------------------------------------------------*/