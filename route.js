const router = require('express').Router();
const assert = require('assert');
const mongo = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const url = process.env.MONGODB_URL;
const dbName = 'dashboard_api'

router.get('/chart1/:userId', function (req, res) {
  const client = new mongo(url, { useNewUrlParser: true, useUnifiedTopology: true });
  const { userId } = req.params;
  client.connect(function (err) {
    assert.equal(null, err);
    const db = client.db(dbName);
    db.collection('user').findOne({ id: parseInt(userId) }, (err, resp) => {
      assert.equal(null, err);
      if (resp) {
        // db.collection('order').find({ user_id:resp._id }).toArray((err, resp) => {
        db.collection('order_transaction').aggregate([
          {
            "$match": {
              "user_id": new ObjectID(resp._id)
            }
          },
          {
            "$group": {
              "_id": {
                "month": "$month"
              },
              "COUNT(month)": {
                "$sum": 1
              }
            }
          },
          {
            "$project": {
              "month": "$_id.month",
              "totalOrder": "$COUNT(month)",
              "_id": 0
            }
          },
          {
            "$sort": {
              "month": -1
            }
          },
          {
            "$limit": 5
          }
        ], {
          allowDiskUse: true
        }).toArray((err, resp) => {
          assert.equal(null, err);
          if (resp) {
            client.close();
            var data = []
            resp.map((item) => {
              data.push({
                month: item.month + 1,
                totalOrder: item.totalOrder
              })
            })
            res.send(data);
          }
        })
      }
    })
  });
})

router.get('/chart2/:userId', function (req, res) {
  const client = new mongo(url, { useNewUrlParser: true, useUnifiedTopology: true });
  const { userId } = req.params;
  client.connect(function (err) {
    assert.equal(null, err);
    const db = client.db(dbName);
    db.collection('user').findOne({ id: parseInt(userId) }, (err, resp) => {
      assert.equal(null, err);
      if (resp) {
        db.collection('order_transaction')
          .find({ user_id: new ObjectID(resp._id) })
          .project({
            "total": "$total",
            "category": "$category",
            "_id": 0
          }).sort([["created_at", -1]]).limit(16)
          .toArray((err, resp) => {
            assert.equal(null, err);
            if (resp) {
              client.close();
              var data = [];
              resp.map(item => {
                data.push({
                  total: item.total,
                  category: item.category
                })
              })
              res.send(data);
            }
          })
      }
    })
  });
})

router.get('/table/:userId', function (req, res) {
  const client = new mongo(url, { useNewUrlParser: true, useUnifiedTopology: true });
  const { userId } = req.params;
  client.connect(function (err) {
    assert.equal(null, err);
    const db = client.db(dbName);
    db.collection('user').findOne({ id: parseInt(userId) }, (err, resp) => {
      assert.equal(null, err);
      if (resp) {
        db.collection('order_transaction')
          .find({ user_id: new ObjectID(resp._id) })
          .project({
            "name": "$name",
            "category": "$category",
            "available": "$available",
            "arrival": "$arrival",
            "_id": "$_id"
          }).sort([["created_at", -1]]).limit(10)
          .toArray((err, resp) => {
            assert.equal(null, err);
            if (resp) {
              client.close();
              var data = [];
              resp.map(item => {
                data.push({
                  _id: item._id,
                  name: item.name,
                  category: item.category,
                  available: item.available,
                  arrival: item.arrival
                })
              })
              res.send(data);
            }
          })
      }
    })
  });
})

router.delete('/table', function (req, res) {
  const client = new mongo(url, { useNewUrlParser: true, useUnifiedTopology: true });
  const { deleteIds } = req.body;


  client.connect(function (err) {
    assert.equal(null, err);
    const db = client.db(dbName);
    var ids = [];
    deleteIds.map(item => {
      ids.push(ObjectID(item._id))
    })
    db.collection('order_transaction').deleteMany({ _id: { '$in': ids } }, (err, resp) => {
      assert.equal(null, err);
      if (resp) {
        client.close();
        res.send({ messagge: 'success' })
      }
    })
  });
})

router.put('/table', function (req, res) {
  const client = new mongo(url, { useNewUrlParser: true, useUnifiedTopology: true });
  const { updateIds, category } = req.body;


  client.connect(function (err) {
    assert.equal(null, err);
    const db = client.db(dbName);
    var ids = [];
    updateIds.map(item => {
      ids.push(ObjectID(item._id))
    })

    db.collection('order_transaction').updateMany({ _id: { '$in': ids } }, { '$set': { category: category } }, (err, resp) => {
      assert.equal(null, err);
      if (resp) {
        client.close();
        res.send({ messagge: 'success' })
      }
    })
  });
})

router.post('/track/:userId', function (req, res) {
  const client = new mongo(url, { useNewUrlParser: true, useUnifiedTopology: true });
  const { data } = req.body;
  const { userId } = req.params;
  client.connect(function (err) {
    assert.equal(null, err);
    const db = client.db(dbName);
    db.collection('user').findOne({ id: parseInt(userId) }, (err, resp) => {
      assert.equal(null, err);
      if (resp) {
        var tempData = [];
        data.map(item => {
          tempData.push({ ...item, user_id: ObjectID(resp._id) })
        })
        db.collection('log').insertMany(tempData, (err, resp) => {
          assert.equal(null, err)
          if (resp) {
            res.send({ messagge: 'success' });
            client.close();
          }
        })
      }
    })
  });

})

module.exports = router;