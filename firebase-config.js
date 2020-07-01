var admin = require("firebase-admin");

var serviceAccount = require("./firebase-adminsdk.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://angular-pwa-399eb.firebaseio.com"
});

module.exports.admin = admin