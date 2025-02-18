const pg = require("pg");
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const client = new pg.Client(
  "postgres://Honor:Ephesians4:29@localhost:5432/acme_store_db"
);

const createTables = async () => {
  const SQL = `
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS products;

CREATE TABLE users(
id UUID PRIMARY KEY,
username VARCHAR (50) UNIQUE,
password VARCHAR(100)
);

CREATE TABLE products(
id UUID PRIMARY KEY,
name VARCHAR (50)
);

CREATE TABLE favorites(
id UUID PRIMARY KEY,
product_id UUID REFERENCES products(id) NOT NULL,
user_id UUID REFERENCES users(id) NOT NULL,
CONSTRAINT unique_product_user UNIQUE(product_id, user_id)
);
`;

  await client.query(SQL);
};

const createProduct = async (name) => {
  const SQL = `
    INSERT INTO products(id, name) VALUES($1, $2) RETURNING *
    `;
  const result = await client.query(SQL, [uuid.v4(), name]);
  return result.rows[0];
};

const createUser = async (username, password) => {
  const SQL = `
    INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *
    `;
  const hashedPassword = await bcrypt.hash(password, 5);
  const result = await client.query(SQL, [uuid.v4(), username, hashedPassword]);
  return result.rows[0];
};

const createFavorites = async (product, userId) => {
  const SQL = ` 
    INSERT INTO favorites(id, product_id, user_id) VALUES($1,
     (SELECT id FROM products WHERE name =$2), $3)  RETURNING *`;
  const result = await client.query(SQL, [uuid.v4(), product, userId]);
  return result.rows[0];
};

const fetchUsers = async () => {
  const SQL = `
    SELECT * FROM users
    `;
  const result = await client.query(SQL);
  return result.rows;
};

const fetchFavorites = async () => {
  const SQL = `
    SELECT * FROM favorites
    `;
  const result = await client.query(SQL);
  return result.rows;
};

const fetchProducts = async () => {
  const SQL = `
    SELECT * FROM products
    `;
  const result = await client.query(SQL);
  return result.rows;
};

const destroyFavorite = async (userId, favoriteId) => {
    const SQL = `
    DELETE FROM favorites WHERE id = $1 and user_id = $2 RETURNING *
    `
    await client.query(SQL, [favoriteId, userId]);
};


const init = async () => {
  console.log("init db layer =)");
  await client.connect();
  await createTables();
  const joe = await createUser("smilingjoe", "password");
  await createUser("frowningFrank", "password");
  const sally = await createUser("cryingSally", "password");
  await createProduct("lotion");
  await createProduct("face wash");
  await createFavorites ("lotion", joe.id)
  await createFavorites("face wash", sally.id)
};

module.exports = {
  init,
  createUser,
  createProduct,
  createFavorites,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  destroyFavorite,
};
