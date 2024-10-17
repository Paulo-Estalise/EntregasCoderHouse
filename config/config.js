const dotenv = require('dotenv');

dotenv.config();

const config = {
    port: process.env.PORT || 8080,
    mongoUri: process.env.MONGODB_URI,
    sessionSecret: process.env.SESSION_SECRET,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET
};

module.exports = { config };

