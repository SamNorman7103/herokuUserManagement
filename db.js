//initial reqs
const Pool = require("pg").Pool;
const url = require("url");
const DBConnectionString = process.env.DATABASE_URL;
const params = url.parse(DBConnectionString);

//authentication
const auth = params.auth.split(":");
let SSL = process.env.SSL;
if (SSL === "false") {
  SSL = false;
} else if ((SSL = "heroku")) {
  SSL = { rejectUnauthorized: false };
} else {
  SSL = true;
}

const config = {
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split("/")[1],
  ssl: SSL,
};
const pool = new Pool(config);

//functions

//render functions
const getUsers = (req, res) => {
  let getUsersSQL = "select * from users ";
  pool.query(getUsersSQL, (err, results) => {
    if (err) throw err;
    let users = results.rows;
    res.render("index", { users: users });
  });
};

const renderEdit = (req, res) => {
  let username = req.params.id.substr(3);
  let getUserSQL = "select * from users where username = $1";
  pool.query(getUserSQL, [username], (err, results) => {
    if (err) throw err;
    res.render("edit", { user: results.rows[0] });
  });
};

const renderAdd = (req, res) => {
  res.render("add");
};
//render end

//Sort and Filter functions
let sorted = false;
const sort = (req, res) => {
  function compareAsc(a, b) {
    const userA = a.age;
    const userB = b.age;

    let comparison = 0;
    if (userA > userB) {
      comparison = 1;
    } else if (userA < userB) {
      comparison = -1;
    }
    return comparison;
  }
  function compareDes(a, b) {
    const userA = a.age;
    const userB = b.age;

    let comparison = 0;
    if (userA > userB) {
      comparison = -1;
    } else if (userA < userB) {
      comparison = 1;
    }
    return comparison;
  }
  if (!sorted) {
    pool.query("select * from users", (err, results) => {
      let newList = results.rows.sort(compareAsc);
      res.render("index", { users: newList });
    });
    sorted = true;
  } else {
    pool.query("select * from users", (err, results) => {
      let newList = results.rows.sort(compareDes);
      res.render("index", { users: newList });
    });
    sorted = false;
  }
};
//Checks for any valid values submitted by user. Returns any db entries with at least one value that matches or if no match returns all
const searchUsers = (req, res) => {
  let search = req.body.search.toLowerCase();
  if (search.split(" ").join("") == "") {
    res.redirect("/")
  } else {
    pool.query("select * from users", (err, results) => {
      if (err) throw err;
      let filteredList = results.rows.filter((x) => {
        let first = x.firstname.toLowerCase();
        let last = x.lastname.toLowerCase();
        let age = x.age;
        let username = x.username.toLowerCase();
        let email = x.email.toLowerCase();
        return (
          first == search ||
          last == search ||
          age == search ||
          username == search ||
          email == search
        );
      });
      res.render("index", { users: filteredList });
    });
  }
};
//Sort and Filter end

//edit functions

//takes user submitted data, obtains the next available row in the DB and inserts the data accordingly
const createUser = (req, res) => {
  const username = req.body.username;
  const first = req.body.firstName;
  const last = req.body.lastName;
  const email = req.body.email;
  const age = req.body.age;

  pool.query("select MAX(username) from users", (err, results) => {
    let updateUserSQL =
      "insert into users (username, firstname, lastname, email, age) values ($1, $2, $3, $4, $5)";
    pool.query(
      updateUserSQL,
      [username, first, last, email, age],
      (err, results) => {
        if (err) throw err;
        res.redirect("/");
      }
    );
  });
};
//finds existing data from the url param, updates any entries who's username matches the url param
const updateUser = (req, res) => {
  const originalusername = req.params.id;

  const username = req.body.username;
  const first = req.body.firstName;
  const last = req.body.lastName;
  const email = req.body.email;
  const age = req.body.age;

  let updateUserSQL =
    "update users set username = $1 ,firstname = $2, lastname = $3, email = $4, age = $5 where username = $6";
  pool.query(
    updateUserSQL,
    [username, first, last, email, age, originalusername],
    (err, results) => {
      if (err) throw err;
      res.redirect("/");
    }
  );
};

//deletes all users whose username equals the id from url param
const deleteUser = (req, res) => {
  const username = req.params.id;

  let deleteUserSQL = "delete from users where username = $1 ";
  pool.query(deleteUserSQL, [username], (err, results) => {
    if (err) throw err;
    res.redirect("/");
  });
};

//edit end

module.exports = {
  getUsers,
  searchUsers,
  createUser,
  updateUser,
  deleteUser,
  renderEdit,
  renderAdd,
  sort,
};
