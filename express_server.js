/*------------------------------Require code----------------------------------*/


const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const morgan = require('morgan');
const app = express();
const PORT = 8080; // default port 8080

// middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'))


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


/*----------------------------Helper functions---------------------------------*/


// Generates a random 6 digit alphanumeric number to be used in short url
const generateRandomString = () => {
  const randomNumber = Math.random();
  const numberInBase36 = randomNumber.toString(36);
  const shortString = numberInBase36.substring(2, 8);
  return shortString;
};



// finds user id in user object
const findUserCookie = (req) => {
  if (!req.cookies.user_id) {
    return {};
  }
  return req.cookies.user_id.id;
}


// checks if user is logged in
const loggedInCheck = (req) => {

  // checks if cookie exists on browser
  if (!req.cookies.user_id) {
    return false;
  }

  // compares id from cookie to id from user in users object
  if (!(findUserCookie(req))) {
    return false;
  }

  //checks if password of id in database matches cookie password
  const userCookieHashedPassword = req.cookies.user_id.hashedPassword;
  const userHashedPassword = users[findUserCookie(req)].hashedPassword;
  if (bcrypt.compareSync(userCookieHashedPassword, userHashedPassword)) {
    return false;
  }

  return true;
};



// Filters urlDatabase object with urls created by a given user ID
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

  if (!loggedInCheck(req)) {
    return res.redirect('/login');
  }

  const user = users[findUserCookie(req)];
  const userUrls = urlsForUser(user);

  const templateVars = {
    user,
    urls: userUrls
  };

  res.render('urls_index', templateVars);
});



// ----GET route which renders the urls_index template---- // 
// routes to form for user to create new url
app.get('/urls/new', (req, res) => {

  // if user attempts to create a new short url while not logged in, redirect to login page
  if (!loggedInCheck(req)) {
    return res.redirect('/login');
  }

  const user = users[findUserCookie(req)];
  const templateVars = { user };

  res.render('urls_new', templateVars);
});



// ----GET route which renders the urls_show template---- //
// routes to short url page based on unique id
app.get('/urls/:id', (req, res) => {

  if (!loggedInCheck(req)) {
    return res.status(401).send('Error 401 - You are not authorized to perform this action. Please login to proceed.');
  }

  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  const user = users[findUserCookie(req)];

  const templateVars = {
    id,
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

  // returns error message if user attempts to perform this action while not logged in (can test in terminal with curl to confirm)
  if (!loggedInCheck(req)) {
    return res.status(401).send('Error 401 - You are not authorized to perform this action. Please login to proceed.');
  }

  const randomKey = generateRandomString();
  const longURL = req.body.longURL;
  const userID = findUserCookie(req);
  
  urlDatabase[randomKey] = { longURL, userID }; // gets removed when server is restarted
  res.redirect(`/urls/${randomKey}`); // responds with redirect to /urls/:id
});



// ----GET route which redirects to long url---- //
app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;

  // redirects to error page if id is invalid
  if (!longURL) {
    return res.status(401).send('Error 400 - Invalid URL');
  }

  res.redirect(longURL);
});



// ----POST route that deletes a URL---- //
app.post('/urls/:id/delete', (req, res) => {

  if (!loggedInCheck(req)) {
    return res.status(401).send('Error 401 - You are not authorized to perform this action. Please login to proceed.');
  }

  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});



// ----POST route that edits the long url of an existing entry---- //
app.post('/urls/:id/update', (req, res) => {

  if (!loggedInCheck(req)) {
    return res.status(401).send('Error 401 - You are not authorized to perform this action. Please login to proceed.');
  }

  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id].longURL = longURL;
  res.redirect('/urls');
});



// ----POST route to handle logout---- //
app.post('/logout', (req, res) => {
  const userIdCookie = req.body.id;
  res.clearCookie('user_id', userIdCookie);
  res.redirect('/login');
});



// ----GET route which renders the registration template---- //
app.get('/register', (req, res) => {
  const user = users[findUserCookie(req)];
  const templateVars = { user };

  // if user attempts to go to register page while already logged in, redirect to urls page
  if (loggedInCheck(req)) {
    return res.redirect('/urls');
  }

  res.render('registration', templateVars);
});



// ----POST route that handles registration form data---- //
app.post('/register', (req, res) => {
  const randomKey = generateRandomString();
  const username = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  // returns error 400 if username or password is no entered
  if (username === '' || password === '') {
    res.status(400).send('Error 400 - Invalid username or password entered');
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
    hashedPassword: hashedPassword
  };

  res.cookie('user_id', users[randomKey]);
  res.redirect('/urls');
});



// ----GET route which renders the login template---- //
app.get('/login', (req, res) => {
  const user = users[findUserCookie(req)];
  const templateVars = { user };
  // if user attempts to go to login page while already logged in, redirect to urls page
  if (loggedInCheck(req)) {
    return res.redirect('/urls');
  }

  res.render('login', templateVars);
});



// ----POST route that handles user login---- //
app.post('/login', (req, res) => {
  const username = req.body.email;
  const password = req.body.password;
  let userFound = undefined;

  // looks for matching user in users object and updates userFound variable if found
  for (const id in users) {
    if (username === users[id].email) {
      userFound = users[id];
    }
  }

  // returns error if user is not found
  if (userFound === undefined) {
    return res.status(403).send('Error 403 - The username entered does not match our records');
  }

  // returns error if user is found but hashed password is incorrect
  if (!bcrypt.compareSync(password, userFound['hashedPassword'])) {
    return res.status(403).send('Error 403 - The password entered does not match our records');
  }

  res.cookie('user_id', userFound);
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