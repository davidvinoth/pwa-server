const express = require('express');
const bodyParser = require('body-parser');
var admin = require("firebase-admin");
const mysql = require('mysql');

var serviceAccount = require("./firebase-adminsdk.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://angular-pwa-399eb.firebaseio.com"
});
const cors = require('cors')

const PORT = 3000;
const app = express();
app.use(bodyParser.json());
app.use(cors())

app.post('/enroll', async function (req, res) {
  let response = {
    id: 1,
    possibility: "Low"
  };
  let result;
  var message = {
    notification: {
      title: 'Risk of COVID-19',
      body: ''
    },
  };

  symptomChecker = JSON.parse(req.body.symptoms);
  console.log('symptomChecker', symptomChecker);
  let symStatus = symptomChecker.includes("No existing conditions");
  console.log('symStatus', symStatus);

  if (req.body.closeContact == 'No' && (symptomChecker && symptomChecker.length == 1) && symStatus && req.body.physicalCondition == "I feel physically normal") {
    message.notification.body = "Low";
    response.possibility = "Low";
  } else if (req.body.closeContact == 'No' || (symptomChecker && symptomChecker.length == 1)) {
    message.notification.body = "Medium";
    response.possibility = "Medium";
  } else {
    message.notification.body = "High";
    response.possibility = "High";
  }

  if (req.body.token) {
    admin.messaging().sendToDevice(req.body.token, message)
      .then((response) => {
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
  }

  if (req.body) {
    let data = req.body;
    console.log(data);

    // var con = await mysql.createConnection({
    //   host: "localhost",
    //   user: "root",
    //   database: "pwa"
    // });

    let symptoms = JSON.stringify(data.symptoms);

    // await new Promise(async (resolve, reject) => {
    //   console.log("Promise");
    //   await con.query(`INSERT INTO user_log(age, close_contact, gender, physical_condition, symptoms) VALUES (${data.age}, "${data.closeContact}", "${data.gender}", "${data.physicalCondition}", ${symptoms})`, function (err, rows) {
    //     console.log("err",err)
    //     if (err) throw reject(new Error("Error!"));
    //     response.id = rows.insertId;
    //     console.log("Insert");
    //     console.log(rows);
    //     resolve(response);
    //   });
    // });

    // await new Promise(async (resolve, reject) => {
    //   await con.query(`select * from user_log where id=${response.id}`, function (err, rows) {
    //     if (err) throw reject(err);

    //     if (rows && rows.length) {
    //       result = rows[0];
    //     }
    //     result.possibility = response.possibility;
    //     result.symptoms = decodeURIComponent(result.symptoms);

    //     console.log("select");
    //     console.log(result);
    //     resolve(result);
    //   });
    // });

    result = data;
    result.possibility = response.possibility;
    result.close_contact = data.closeContact;
    result.physical_condition = data.physicalCondition;

    res.header("Content-Type", 'application/json');
    console.log("return");
    console.log(result);

    res.status(200).send({
      success: true,
      result: result
    });

  }

    //   res.status(200).send({
    //   success: true
    // });
})

app.get('/state-wise-list', function (req, res) {
  const data = require('./database.json')
  res.header("Content-Type", 'application/json');
  res.send(JSON.stringify(data));
});

// app.listen(PORT, function () {
//   console.log("Server running on localhost:" + PORT);
// });

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started running");
});