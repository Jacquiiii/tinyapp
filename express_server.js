/*------------------------------Require code----------------------------------*/


const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

// middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


/*----------------------------Database Objects--------------------------------*/


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.wizardingworld.com/",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://harrypottershop.com/",
    userID: "aJ48lW",
  },
  wj8so2: {
    longURL: "https://www.hogwartslegacy.com/",
    userID: "b890i7",
  },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "hpotter@hogwarts.com",
    password: "voldemort",
  },
  b890i7: {
    id: "b890i7",
    email: "ron.weasly@hogwarts.com",
    password: "wingardium-leviosa",
  },
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
  // console.log(req.cookies.user_id);
  return req.cookies.user_id.id;
}


//
const loggedInCheck = (req) => {

  // checks if cookie exists on browser
  if (!req.cookies.user_id) {
    return false;
  }
  //checks if id of cookie is in database
  if (!(findUserCookie(req))) {
    return false;
  }

  const userCookiePassword = req.cookies.user_id.password;
  const userPassword = users[findUserCookie(req)].password;

  //checks if password of id in database matches cookie password
  if (userCookiePassword !== userPassword) {
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
  console.log('test : ', urlsForUser(user));

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

  console.log(userID);
  console.log(urlDatabase);
  
  urlDatabase[randomKey] = { longURL, userID }; // gets removed when server is restarted
  console.log(urlDatabase);
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



// // ----POST route to handle login (no longer req) ---- //
// app.post('/login', (req, res) => {
//   const usernameCookie = req.body.username;
//   res.cookie('username', usernameCookie);
//   res.redirect('/urls');
// });



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
    password: password
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

  // returns error if user is found but password is incorrect
  if (userFound.password !== password) {
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