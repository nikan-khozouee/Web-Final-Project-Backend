const express = require("express");
const postgres = require("postgres");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function (_, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

const port = 3000;

// app.js
PGHOST = "ep-mute-frost-a2hbnuw0.eu-central-1.aws.neon.tech";
PGDATABASE = "final-project";
PGUSER = "nikarrow81@gmail.com";
PGPASSWORD = "Dfua0W8KBwcX";
ENDPOINT_ID = "ep-mute-frost-a2hbnuw0";

const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: "require",
  connection: {
    options: `project=${ENDPOINT_ID}`,
  },
});

async function getPgVersion() {
  const result = await sql`select version()`;
  console.log(result);
}

getPgVersion();

app.get("/games", async (req, res) => {
  const { search, sort, genre, developer, rating, order } = req.query;
  let query = `SELECT games.title, genres.name, game_developers.developer_name, release_date, age_rating, views FROM games
  JOIN genres ON games.genre_id = genres.genre_id
  JOIN  game_developers on games.developer_id = game_developers.developer_id`;
  let conditions = [];
  let queryParams = [];

  if (search) {
    conditions.push(`title ILIKE $${conditions.length + 1}`);
    queryParams.push(`%${search}%`);
  }

  if (genre) {
    conditions.push(`genres.name ILIKE $${conditions.length + 1}`);
    queryParams.push(genre);
  }

  if (developer) {
    conditions.push(`developer_name ILIKE $${conditions.length + 1}`);
    queryParams.push(developer);
  }

  if (rating) {
    conditions.push(`age_rating ILIKE $${conditions.length + 1}`);
    queryParams.push(rating);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  const validSortFields = ["release_date", "views", "title"];
  const sortOrder = order === "desc" ? "DESC" : "ASC";
  if (sort && validSortFields.includes(sort)) {
    query += ` ORDER BY ${sort} ${sortOrder}`;
  } else if (sort) {
    return res.status(400).json({ error: "Invalid sort parameter" });
  }

  try {
    const result = await sql.unsafe(query, queryParams);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/genres", async (request, response) => {
  try {
    const result = await sql`SELECT * FROM genres`;
    response.status(200).json(result);
  } catch (error) {
    response.status(500).json({ error: "Internal server error" });
  }
});

app.get("/game_developers", async (request, response) => {
  try {
    const result = await sql`SELECT * FROM game_developers`;
    response.status(200).json(result);
  } catch (error) {
    response.status(500).json({ error: "Internal server error" });
  }
});

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const headers = request.headers;
  console.log(headers);
  const foundUser =
    await sql`SELECT * FROM users WHERE username = ${username} AND password = ${password};`;
  console.log(foundUser);
  if (foundUser && foundUser.length > 0) {
    response.send({ user: foundUser[0] });
    response.send({
      user: {
        user_id: foundUser[0].user_id,
        username: foundUser[0].username,
        email: foundUser[0].email,
        role: foundUser[0].role,
      },
    });
    return;
  }
  response.send({ error: true, message: "wrong username and/or password" });
  return;
});

app.listen(port, () =>
  console.log(`My App listening at http://localhost:${port}`)
);
