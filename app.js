const express = require('express');
const cors = require("cors");
const fileUpload = require('express-fileupload');

const dotenv = require('dotenv').config()
const cookieParser = require('cookie-parser')
const helmet = require('helmet')

const app = express();
const port = 3000;


app.use(cors())
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser())
app.use(helmet())
app.use(fileUpload({
  createParentPath: true
}));


app.get("/", (req, res) => {
    res.json({ message: "Welcome to our application." });
});

// require("./app/routes/tutorial.routes.js")(app);
require("./app/routes/account.routes.js")(app);
require("./app/routes/filemanager.routes")(app);
require("./app/routes/admin.routes")(app);
require("./app/routes/exam.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
