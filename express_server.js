/*------------------------------Require code----------------------------------*/


const express = require('express');
const cookieSession = require('cookie-session');
const { generateRandomString, getUserByEmail } = require('./helpers.js');
const bcrypt = require('bcryptjs');
const morgan = require('morgan');
const app = express();
const PORT = 8080; // default port 8080


// middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['secret1', 'secret2'],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(morgan('dev'));


/*----------------------------Database Objects--------------------------------*/


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.wizardingworld.com/",
    userID: "hovkyj",
  },
  i3BoGr: {
    longURL: "https://harrypottershop.com/",
    userID: "hovkyj",
  },
  wj8so2: {
    longURL: "https://www.hogwartslegacy.com/",
    userID: "bwt5r1",
  },
};

const users = {
  hovkyj: {
    id: 'hovkyj',
    email: 'hpotter@hogwarts.com',
    hashedPassword: '$2a$10$qxFUwthyyQXJz8l4L/a3Cez93j.2Ugle1qojeUPKkhIm67PdmASoS' // password: ilovehedwig
  },
  bwt5r1: {
    id: 'bwt5r1',
    email: 'ron.weasly@hogwarts.com', // password: Hermoine
    hashedPassword: '$2a$10$aLC/QooN1ya3vAqeSRa5Zu4U3JwCTQnVS1.eTHAJnC..OGrNM0bAC'
  }
};


/*----------------------------Helper function---------------------------------*/



// Filters urlDatabase object with urls created by a given user ID
// Not added to helpers.js as it must be in this file to work
const urlsForUser = (userId) => {
  const filteredUrls = {};

  for (const urlID in urlDatabase) {
    if (userId.id === urlDatabase[urlID].userID) {
      filteredUrls[urlID] = urlDatabase[urlID];
    }
  }
  return filteredUrls;
};



/*--------------------------------Route code-----------------------------------*/



// ----route to home page---- //
app.get('/', (req, res) => {
  res.send('Hello!');
});



// ----route displays only the text Hello World---- //
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});



// ----route displays data in urlDatabase object---- //
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});



// ----GET route which renders the urls_index template---- //
// route displays all urls from urlDatabase object
app.get('/urls', (req, res) => {

  let id = null;
  if (req.session.user_data && req.session.user_data.id) {
    id = req.session.user_data.id;
  }

  const user = users[id];

  if (!user) {
    return res.redirect('/login');
  }

  const urls = urlsForUser(user);
  const templateVars = { user, urls };

  res.render('urls_index', templateVars);
});



// ----GET route which renders the urls_index template---- //
// routes to form for user to create new url
app.get('/urls/new', (req, res) => {

  let id = null;
  if (req.session.user_data && req.session.user_data.id) {
    id = req.session.user_data.id;
  }

  const user = users[id];

  // if user attempts to create a new short url while not logged in, redirect to login page
  if (!user) {
    return res.redirect('/login');
  }

  const templateVars = { user };

  res.render('urls_new', templateVars);
});



// ----GET route which renders the urls_show template---- //
// routes to short url page based on unique id
app.get('/urls/:id', (req, res) => {

  let id = null;
  if (req.session.user_data && req.session.user_data.id) {
    id = req.session.user_data.id;
  }

  const user = users[id];

  if (!user) {
    return res.status(401).send('Error 401 - You are not authorized to perform this action. Please login to proceed.');
  }

  const longURL = urlDatabase[req.params.id].longURL;

  const templateVars = {
    id: req.params.id,
    longURL,
    user
  };

  // redirects to error page if id is invalid
  if (!longURL) {
    return res.status(401).send('Error 400 - Invalid URL');
  }
  res.render('urls_show', templateVars);
});



// ----POST route which receives form submission from /urls/new---- //
// adds the url to the urlDatabase object with a random id for a key, then redirects to long url if user clicks on the hyperlinked key
app.post('/urls', (req, res) => {

  let id = null;
  if (req.session.user_data && req.session.user_data.id) {
    id = req.session.user_data.id;
  }

  const user = users[id];

  // returns error message if user attempts to perform this action while not logged in (can test in terminal with curl to confirm)
  if (!user) {
    return res.status(401).send('Error 401 - You are not authorized to perform this action. Please login to proceed.');
  }

  const randomKey = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[randomKey] = { longURL, userID: id }; // gets removed when server is restarted
  res.redirect(`/urls/${randomKey}`); // responds with redirect to /urls/:id
});



// ----GET route which redirects to long url---- //
app.get('/u/:id', (req, res) => {
  // const id = req.session.user_data.id;

  let id = null;
  if (req.session.user_data && req.session.user_data.id) {
    id = req.session.user_data.id;
  }

  const user = users[id];

  // returns error message if user attempts to perform this action while not logged in (can test in terminal with curl to confirm)
  if (!user) {
    return res.status(401).send('Error 401 - You are not authorized to perform this action. Please login to proceed.');
  }

  const longURL = urlDatabase[req.params.id].longURL;

  // redirects to error page if id is invalid
  if (!longURL) {
    return res.status(401).send('Error 400 - Invalid URL');
  }

  res.redirect(longURL);
});



// ----POST route that deletes a URL---- //
app.post('/urls/:id/delete', (req, res) => {

  let id = null;
  if (req.session.user_data && req.session.user_data.id) {
    id = req.session.user_data.id;
  }
  // const id = req.session.user_data.id;
  const user = users[id];

  if (!user) {
    return res.status(401).send('Error 401 - You are not authorized to perform this action. Please login to proceed.');
  }

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});



// ----POST route that edits the long url of an existing entry---- //
app.post('/urls/:id/update', (req, res) => {
  // const id = req.session.user_data.id;
  let id = null;
  if (req.session.user_data && req.session.user_data.id) {
    id = req.session.user_data.id;
  }

  const user = users[id];

  if (!user) {
    return res.status(401).send('Error 401 - You are not authorized to perform this action. Please login to proceed.');
  }

  const longURL = req.body.longURL;
  urlDatabase[req.params.id].longURL = longURL;
  res.redirect('/urls');
});



// ----POST route to handle logout---- //
app.post('/logout', (req, res) => {
  let id = null;
  if (req.session.user_data && req.session.user_data.id) {
    id = req.session.user_data.id;
  }
  req.session = null;
  res.redirect('/login');
});



// ----GET route which renders the registration template---- //
app.get('/register', (req, res) => {

  let id = null;
  if (req.session.user_data && req.session.user_data.id) {
    id = req.session.user_data.id;
  }

  const user = users[id];
  const templateVars = { user };

  // if user attempts to go to register page while already logged in, redirect to urls page
  if (user) {
    return res.redirect('/urls');
  }

  res.render('registration', templateVars);
});



// ----POST route that handles registration form data---- //
app.post('/register', (req, res) => {
  const randomKey = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  // returns error 400 if username or password is no entered
  if (email === '' || password === '') {
    res.status(400).send('Error 400 - Invalid username or password entered');
    return;
  }

  // returns error 400 if user already exists
  if (getUserByEmail(email, users)) {
    return res.status(400).send('Error 400 - The email entered already exists');
  }

  // creates new user and adds to users object if the above conditions are not met
  users[randomKey] = {
    email,
    id: randomKey,
    hashedPassword: hashedPassword
  };

  // creates object to pass into session cookie
  const userData = {
    id: randomKey
  };

  req.session.user_data = userData;
  res.redirect('/urls');
});



// ----GET route which renders the login template---- //
app.get('/login', (req, res) => {
  // const id = req.session.user_data && req.session.user_data.id;

  let id = null;
  if (req.session.user_data && req.session.user_data.id) {
    id = req.session.user_data.id;
  }

  const user = users[id];
  const templateVars = { user };

  // if user attempts to go to login page while already logged in, redirect to urls page
  if (user) {
    return res.redirect('/urls');
  }

  res.render('login', templateVars);
});



// ----POST route that handles user login---- //
app.post('/login', (req, res) => {

  let id = null;
  if (req.session.user_data && req.session.user_data.id) {
    id = req.session.user_data.id;
  }

  const email = req.body.email;
  const password = req.body.password;
  let userFound = null;

  // looks for matching user in users object and updates userFound variable if found
  const user = users[getUserByEmail(email, users)];
  if (getUserByEmail(email, users)) {
    userFound = user;
  }

  // returns error if user is not found
  if (!userFound) {
    return res.status(403).send('Error 403 - The username entered does not match our records');
  }

  // returns error if user is found but hashed password is incorrect
  if (!bcrypt.compareSync(password, userFound['hashedPassword'])) {
    return res.status(403).send('Error 403 - The password entered does not match our records');
  }

  const userData = { id: userFound.id };

  req.session.user_data = userData;
  res.redirect('/urls');
});



// // ----GET route for client errors (no longer req)---- //
// app.get('/404', (req, res) => {
//   res.render('404');
// });



/*---------------------------Server connection code----------------------------*/


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


/*-----------------------------------------------------------------------------*/