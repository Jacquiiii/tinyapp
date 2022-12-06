// Stores URLs created by user
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


// Stores user details after registration
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


module.exports = { urlDatabase, users };