
const express = require('express')
const path = require("path");
const app = express()

const http = require('https');

require('dotenv').config()
const mysql = require('mysql2/promise')

var url = 'https://api.forecast.solar/estimate/49.3898408/2.9431103/35/0/3?time=utc';
/*
console.log('Connected to PlanetScale!');
connection.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'solarpunk0'`, function(err, tables){ 
  console.log(tables);
});*/

//connection.end()


// #############################################################################
// This configures static hosting for files i n /public that have the extensions
// listed in the array.
var options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html','css','js','ico','jpg','jpeg','png','svg'],
  index: ['index.html'],
  maxAge: '1m',
  redirect: false
}
app.use(express.static('dist', options))

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`React app listening at http://localhost:${port}`)
})

const foptions = {
  headers: {
    'Accept': 'application/json'
  }
};

async function fetchData(url) {
  
  return new Promise((resolve, reject) => {
    http.get(url, foptions,  (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        resolve(JSON.parse(data));
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function insertData() {
  connection = await mysql.createConnection(process.env.DATABASE_URL);
  try {  
    const response = await fetchData(url, foptions);

    for (var el in response.result.watts)
    {
     // console.log(el);
      //console.log( response.result.watts[el]);

    //  const values = Object.values(data);
      const query = "INSERT INTO Anticipation (captured, concerns, forecasted, val) VALUES (DATE_FORMAT(now(), '%Y-%m-%d %H:00:00'), '" + el + "', TIMESTAMPDIFF(SECOND, DATE_FORMAT(now(), '%Y-%m-%d %H:00:00'), '"+el+"'),'" + response.result.watts[el]+"')";
      await connection.query(query);
  
    }

    console.log('Data inserted successfully');
    await connection.end();
  } catch (error) {
    console.error(error);
  }
}


app.get('/do', async (req, res) => {
  console.log('Got do');
  
  await insertData();
  res.json({});
  console.log('ok  do');
});

