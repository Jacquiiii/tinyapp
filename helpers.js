// Generates a random 6 digit alphanumeric number to be used in short url
const generateRandomString = () => {
  const randomNumber = Math.random();
  const numberInBase36 = randomNumber.toString(36);
  const shortString = numberInBase36.substring(2, 8);
  return shortString;
};


// Returns the user data if email is found
const getUserByEmail = (email, database)=> {
  for (const userData in database) {
    if (email === database[userData].email) {
      return userData;
    }
  }
};


module.exports = { generateRandomString, getUserByEmail };