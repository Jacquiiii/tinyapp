const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.wizardingworld.com/",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://harrypottershop.com/",
    userID: "aJ48lW",
  },
  iy99ss: {
    longURL: "https://harrypottershops.com/",
    userID: "5",
  },
};

// urlDatabase['h3h3h3'] = {
//   longURL: 'wtete',
//   userID: '5'
// }

// delete urlDatabase['i3BoGr'];
// console.log(urlDatabase);



const urlsForUser = (id) => {
  const filteredUrls = {...urlDatabase};

  for (const urlID in urlDatabase) {
    if (id !== urlDatabase[urlID].userID) {
      delete filteredUrls[urlID];
    }
  }
  return filteredUrls;
}

console.log(urlsForUser('aJ48lW'));
