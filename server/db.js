const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL ||
    "postgres://localhost/the_acme_reservation_planner"
);
const uuid = require("uuid");

const createTables = async () => {
  const SQL = `
    CREATE TABLE IF NOT EXISTS customers(
        id UUID PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS restaurants(
        id UUID PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS reservations(
        id UUID PRIMARY KEY,
        date DATE NOT NULL,
        party_count INTEGER NOT NULL,
        restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
        customer_id UUID REFERENCES customers(id) NOT NULL
    );
    `;
  await client.query(SQL);
};

const createCustomer = async ({ name }) => {
  const SQL = `
    INSERT INTO customers (id, name)
    VALUES($1, $2)
    RETURNING *;
    `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const createRestaurant = async ({ name }) => {
  const SQL = `
    INSERT INTO restaurants (id, name)
    VALUES ($1, $2)
    RETURNING *;
    `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const fetchCustomers = async () => {
  const SQL = `
    SELECT * FROM customers;`;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchRestaurants = async () => {
  const SQL = `
    SELECT * FROM restaurants;`;
  const response = await client.query(SQL);
  return response.rows;
};
const fetchReservations = async () => {
  const SQL = `
    SELECT customers.name as name, restaurants.name as rest, res.date AS reservation_date, 
    res.party_count FROM customers
    INNER JOIN reservations as res
    ON customers.id = res.customer_id
    INNER JOIN restaurants
    ON res.restaurant_id = restaurants.id;
    `;
  const response = await client.query(SQL);
  return response.rows;
};

const createReservation = async ({ cust_id, rest_id, party_count, date }) => {
  const SQL = `
    INSERT INTO reservations(id, date, party_count, restaurant_id, customer_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
    `;
  const response = await client.query(SQL, [
    uuid.v4(),
    date,
    party_count,
    rest_id,
    cust_id,
  ]);
  return response.rows[0];
};

const destroyReservation = async ({ res_id, cust_id }) => {
  const SQL = `
    DELETE FROM reservations
    WHERE id = $1 and customer_id = $2
    `;
  await client.query(SQL, [res_id, cust_id]);
};

module.exports = {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  createReservation,
  destroyReservation,
};
