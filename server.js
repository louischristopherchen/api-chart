require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const route = require('./route');
const mongo = require('mongodb').MongoClient;
const assert = require('assert');
const { listOrder,listUser } = require('./seed/dummy')

const PORT = process.env.PORT;
const url = process.env.MONGODB_URL;
const client = new mongo(url, { useNewUrlParser: true, useUnifiedTopology: true });
const dbName = 'dashboard_api'
client.connect(function (err) {
  assert.equal(null, err);
  const db = client.db(dbName);
  db.collection('order_transaction').deleteMany({}, (err, resp) => {
    assert.equal(null, err);
    if (resp) {
      db.collection('user').deleteMany({}, (err, resp) => {
        assert.equal(null, err);
        if (resp) {
          console.log("Empty collection done!!!");
          db.collection('user').insertMany(listUser, (err, resp) => {
            assert.equal(null, err);
            if (resp) {
              var tempListOrder = []
              listOrder.map((item,index)=>{
                if(index<25){
                  tempListOrder.push({...item,user_id:resp.insertedIds[0]})
                } else {
                  tempListOrder.push({...item,user_id:resp.insertedIds[1]})
                }
              })
              db.collection('order_transaction').insertMany(tempListOrder, (err, resp) => {
                assert.equal(null, err);
                if (resp) {
                  db.createCollection('log', (err, resp) => {
                    assert.equal(null, err);
                    if (resp) {
                      client.close();
                      console.log("succes create new collection");
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  })
});

app.use(cors());


app.use(bodyParser.json());
app.use(route);
app.listen(PORT, () => {
  console.log(`server run on ${PORT}`);
});