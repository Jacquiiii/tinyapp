/*------------------------------Require code----------------------------------*/


const express = require('express');
const cookieSession = require('cookie-session');
const { generateRandomString, getUserByEmail } = require('./helpers.js');
const bcrypt = require('bcryptjs');
const morgan = require('morgan');
const app = express();
const PORT = 8080; // default port 8080


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
    hashedPassword: '$2a$10$qxFUwthyyQXJz8l4L/a3Cez93j.2Ugle1qojeUPKkhIm67PdmASoS' // password: ilovehedwig (for testing purposes)
  },
  bwt5r1: {
    id: 'bwt5r1',
    email: 'ron.weasly@hogwarts.com', // password: Hermoine (for testing purposes)
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



/*------------------------------GET route code---------------------------------*/



// ------ GET / route ------ //
app.get('/', (req, res) => {
  res.redirect('/login');
});



// ------ GET /urls.json route displays data in urlDatabase object---- //
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});



// ------ GET /urls route ------ //
app.get('/urls', (req, res) => {

  // determines if there is a current session cookie
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



// ------ GET /urls/new route to create new URL ------ //
app.get('/urls/new', (req, res) => {

  // determines if there is a current session cookie
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



// ------ GET /urls/:id route to short url ------ //
// routes to short url page based on unique id
app.get('/urls/:id', (req, res) => {

  // determines if there is a current session cookie
  let id = null;
  if (req.session.user_data && req.session.user_data.id) {
    id = req.session.user_data.id;
  }
  const user = users[id];

  // directs to an error if user is not logged in
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



// ----GET /u/:id route which redirects to long url---- //
app.get('/u/:id', (req, res) => {

  const longURL = urlDatabase[req.params.id].longURL;

  // returns error if url is invalid
  if (!longURL) {
    return res.status(401).send('Error 400 - Invalid URL');
  }

  res.redirect(longURL);
});



// ----GET /register route which renders the registration template---- //
app.get('/register', (req, res) => {

  // determines if there is a current session cookie
  let id = null;
  if (req.session.user_data && req.session.user_data.id) {
    id = req.session.user_data.id;
  }

  const user = users[id];
  const templateVars = { user };

  // redirects to urls page if user attempts to go to register page while already logged in
  if (user) {
    return res.redirect('/urls');
  }

  res.render('registration', templateVars);
});



// ----GET /login route which renders the login template---- //
app.get('/login', (req, res) => {

  // determines if there is a current session cookie
  let id = null;
  if (req.session.user_data && req.session.user_data.id) {
    id = req.session.user_data.id;
  }

  const user = users[id];
  const templateVars = { user };

  // redirect to login page if user attempts to go to login page while already logged in
  if (user) {
    return res.redirect('/urls');
  }

  res.render('login', templateVars);
});



/*------------------------------POST route code--------------------------------*/



// ----- POST /urls route which receives form submission from /urls/new ----- //
app.post('/urls', (req, res) => {

  // determines if there is a current session cookie
  let id = null;
  if (req.session.user_data && req.session.user_data.id) {
    id = req.session.user_data.id;
  }
  const user = users[id];

  // returns error message if user attempts to perform this action while not logged in
  if (!user) {
    return res.status(401).send('Error 401 - You are not authorized to perform this action. Please login to proceed.');
  }

  const randomKey = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[randomKey] = { longURL, userID: id }; // gets removed when server is restarted
  res.redirect(`/urls/${randomKey}`); // responds with redirect to /urls/:id
});



// ----POST /urls/:id/delete route that deletes a URL---- //
app.post('/urls/:id/delete', (req, res) => {

  // determines if there is a current session cookie
  let id = null;
  if (req.session.user_data && req.session.user_data.id) {
    id = req.session.user_data.id;
  }
  const user = users[id];

  // returns error if user is not logged in
  if (!user) {
    return res.status(401).send('Error 401 - You are not authorized to perform this action. Please login to proceed.');
  }

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});



// ----POST /urls/:id/update route that edits the long url of an existing entry---- //
app.post('/urls/:id/update', (req, res) => {
  
  // determines if there is a current session cookie
  let id = null;
  if (req.session.user_data && req.session.user_data.id) {
    id = req.session.user_data.id;
  }
  const user = users[id];

  // returns error if user is not logged in
  if (!user) {
    return res.status(401).send('Error 401 - You are not authorized to perform this action. Please login to proceed.');
  }

  const longURL = req.body.longURL;
  urlDatabase[req.params.id].longURL = longURL;
  res.redirect('/urls');
});



// ----POST /logout route to handle logout---- //
app.post('/logout', (req, res) => {

  // determines if there is a current session cookie
  let id = null;
  if (req.session.user_data && req.session.user_data.id) {
    id = req.session.user_data.id;
  }

  // clears session cookie
  req.session = null;

  res.redirect('/login');
});



// ----POST /register route that handles registration form data---- //
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

  // creates object to pass into session cookie (more data can be added should it become necessary in the future)
  const userData = { id: randomKey };

  req.session.user_data = userData;
  res.redirect('/urls');
});



// ----POST /login route that handles user login---- //
app.post('/login', (req, res) => {

  // determines if there is a current session cookie
  let id = null;
  if (req.session.user_data && req.session.user_data.id) {
    id = req.session.user_data.id;
  }

  const email = req.body.email;
  const password = req.body.password;
  let userFound = null;

  // looks for matching email and updates userFound variable if found
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



/*---------------------------Server connection code----------------------------*/



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



/*-----------------------------------------------------------------------------*/