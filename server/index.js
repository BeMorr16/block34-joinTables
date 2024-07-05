const {
  client,
  createTables,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  createCustomer,
  createRestaurant,
  createReservation,
  destroyReservation,
} = require("./db");
const express = require("express");
const app = express();
app.use(express.json());

app.get("/api/customers", async (req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch (error) {
    next(error);
  }
});

app.get("/api/restaurants", async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (error) {
    next(error);
  }
});

app.get("/api/reservations", async (req, res, next) => {
  try {
    res.send(await fetchReservations());
  } catch (error) {
    next(error);
  }
});

app.post('/api/customers', async (req, res, next) => {
    try {
        res.status(201).send(await createCustomer({name: req.body.name}))
    } catch (error) {
        next(error)
    }
})

app.post('/api/restaurants', async (req, res, next) => {
    try {
        res.status(201).send(await createRestaurant({name: req.body.name}))
    } catch (error) {
        next(error)
    }
})

app.post("/api/customers/:id/reservations", async (req, res, next) => {
  try {
    res
      .status(201)
      .send(
        await createReservation({
          cust_id: req.params.id,
          rest_id: req.body.restaurant_id,
          date: req.body.date,
          party_count: req.body.party_count,
        })
      );
  } catch (error) {
    next(error);
  }
});

app.delete(
  "/api/customers/:customer_id/reservations/:id",
  async (req, res, next) => {
    try {
      await destroyReservation({
        res_id: req.params.id,
        cust_id: req.params.customer_id,
      });
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
);
app.use((err, req, res, next) => {
  res.status(err.status || 500).send({ error: err.message || err });
});

let seededData = true; //Change this to false ONCE to seed the data. 

const init = async () => {
  await client.connect();
  console.log("connected to database");
  await createTables();

    if (!seededData) {

        const [bob, alice, outback, chipotle] = await Promise.all([
            createCustomer({name: 'bob'}),
            createCustomer({name: 'alice'}),
            createRestaurant({name: 'outback'}),
            createRestaurant({name: 'chipotle'})
        ])
        const [vaca1, vaca2] = await Promise.all([
            createReservation({
                cust_id: bob.id,
                rest_id: outback.id,
                date: '07/19/24',
                party_count: 8,
            }),
            createReservation({
                cust_id: alice.id,
                rest_id: chipotle.id,
                date: '08/09/24',
                party_count: 5,
            })
        ])
        console.log(bob, alice, outback, chipotle, vaca1, vaca2);
    }


  const port = process.env.PORT || 5173;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
};

init();
