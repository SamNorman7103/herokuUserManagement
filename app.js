//initial reqs
const express = require("express");
const path = require("path");
const app = express();
const db = require("./db");
const port = process.env.PORT || 3000;

//join paths to views
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//routing
app.get("/", db.getUsers);
app.post("/search", db.searchUsers);
app.get("/sort", db.sort);
app.get("/create", db.renderAdd);
app.post("/create", db.createUser);
app.get("/edit/:id", db.renderEdit);
app.post("/edit/:id", db.updateUser);
app.post("/delete/:id", db.deleteUser);

app.listen(port, () => {
  console.log(`app listening on port: ${port}`);
});
