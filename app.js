const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
const { Elections } = require("./models");

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(cookieParser("Some secret info"));
app.use(flash());
app.use(
  session({
    secret: "SuperSecrectInformation",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
    resave: false,
    saveUninitialized: true,
  })
);
app.use(csrf("UicgFjabMtvsSJEHUSfK3Dz0NR6K0pIm", ["DELETE", "PUT", "POST"]));

app.use(passport.initialize());
app.use(passport.session());
app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/election/:id([0-9]+)", async (req, res) => {
  // console.log(req.params.id)
  try {
    if (req.params.id) {
      const election = await Elections.findByPk(req.params.id);
      if (election && (election.ended || election.isLive)) {
        res.redirect("/voter");
      } else {
        res.render("404");
      }
    } else {
      res.render("404");
    }
  } catch {
    (error) => {
      console.log(error);
      res.render("404");
    };
  }
});

app.get(
  "/election/:cstring([a-zA-z]+[0-9a-zA-Z]*(?:_[a-z0-9]+)*)",
  async (req, res) => {
    // console.log(req.params.cstring)
    try {
      if (req.params.cstring) {
        const election = await Elections.findOne({
          where: {
            customString: req.params.cstring,
          },
        });
        if (election && (election.ended || election.isLive)) {
          res.redirect("/voter");
        } else {
          res.render("404");
        }
      } else {
        res.render("404");
      }
    } catch {
      (error) => {
        console.log(error);
        res.render("404");
      };
    }
  }
);

app.use("/admin", require("./routes/electionAdmin"));
app.use("/voter", require("./routes/voter"));

module.exports = app;
