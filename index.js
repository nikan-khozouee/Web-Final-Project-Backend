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
    "X-Requested-With,content-type"
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
  let query = `SELECT * FROM games`;
  let conditions = [];
  let queryParams = [];

  if (search) {
    conditions.push(`title ILIKE $${conditions.length + 1}`);
    queryParams.push(`%${search}%`);
  }

  if (genre) {
    conditions.push(`genre_id = $${conditions.length + 1}`);
    queryParams.push(genre);
  }

  if (developer) {
    conditions.push(`developer_id = $${conditions.length + 1}`);
    queryParams.push(developer);
  }

  if (rating) {
    conditions.push(`age_rating = $${conditions.length + 1}`);
    queryParams.push(rating);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  const validSortFields = ["release_date", "views", "title"];
  const sortOrder = order === "desc" ? "DESC" : "ASC"; // Defaults to ASC if order is not 'desc'
  if (sort && validSortFields.includes(sort)) {
    query += ` ORDER BY ${sort} ${sortOrder}`;
  } else if (sort) {
    return res.status(400).json({ error: "Invalid sort parameter" });
  }

  try {
    const result = await sql.unsafe(query, queryParams); // Ensure sql.unsafe is properly handled or replaced with a safer method
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () =>
  console.log(`My App listening at http://localhost:${port}`)
);