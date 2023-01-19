const router = require("express").Router();
const connectEnsureLogin = require("connect-ensure-login");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const {
  Voters,
  Question,
  Option,
  Elections,
  ElectionAdmin,
  Vote,
} = require("../models");

const saltRounds = 10;

router.use(passport.initialize());
router.use(passport.session());

passport.use(
  "adminAuth",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      console.log("Authenticating User", email, password);
      ElectionAdmin.findOne({ where: { email: email } })
        .then(async (user) => {
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password 🤯" });
          }
        })
        .catch(() => {
          return done(null, false, {
            message: "Invalid email or You are not Registerd with Us.",
          });
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing User in session", user.id);
  done(null, user);
});

passport.deserializeUser(async (user, done) => {
  console.log(
    "Deserializing User from session",
    user.id,
    user.email || user.voterid
  );
  if (user.email && user.id) {
    const admin = await ElectionAdmin.findOne({
      where: { email: user.email, id: user.id },
    });
    done(null, admin);
  } else if (user.id && user.voterid) {
    const voter = await Voters.findOne({
      where: { voterid: user.voterid, id: user.id },
    });
    done(null, voter);
  } else {
    done("User Not Found", null);
  }
});

router.get("/", async (req, res) => {
  res.render("admin/index", {
    title: "Admin Dashboard",
    csrfToken: req.csrfToken(),
  });
});

router.get(
  "/login",
  connectEnsureLogin.ensureLoggedOut({ redirectTo: "/admin/elections" }),
  (req, res) => {
    res.render("admin/login", {
      title: "Admin Login",
      csrfToken: req.csrfToken(),
    });
  }
);

router.get(
  "/signup",
  connectEnsureLogin.ensureLoggedOut({ redirectTo: "/admin/elections" }),
  (req, res) => {
    res.render("admin/signup", {
      title: "Admin Signup",
      csrfToken: req.csrfToken(),
    });
  }
);

router.post(
  "/login",
  connectEnsureLogin.ensureLoggedOut({ redirectTo: "/admin/elections" }),
  passport.authenticate("adminAuth", {
    successRedirect: "/admin/elections",
    failureRedirect: "/admin/login",
    failureFlash: true,
  }),
  (req, res) => {
    res.redirect("/admin/elections");
  }
);

router.post(
  "/signup",
  connectEnsureLogin.ensureLoggedOut("/admin/elections"),
  async (req, res) => {
    console.log("Signing up a new admin");
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const newAdmin = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: hashedPassword,
      username: req.body.username,
    };
    try {
      const admin = await ElectionAdmin.create(newAdmin);
      req.login(admin, (error) => {
        if (error) {
          // console.log(error);
          res.status(422).json(error);
        }
        res.redirect("/admin/elections");
      });
    } catch (error) {
      console.log(error);
      req.flash(
        "error",
        error.errors.map((error) => error.message)
      );
      console.log(error.errors.map((error) => error.message));
      res.redirect("/admin/signup");
    }
  }
);

router.get(
  "/signout",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/admin/elections" }),
  (req, res, next) => {
    req.logout((err) => {
      if (err) {
        next(err);
      }
      console.log("User Logged Out");
      res.redirect("/");
    });
  }
);

router.get(
  "/elections",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/admin/" }),
  async (req, res) => {
    const liveElections = await Elections.getLiveElectionsofUser({
      UId: req.user.id,
    });
    const elections = await Elections.getElectionsofUser({ UId: req.user.id });
    if (req.accepts("html")) {
      res.render("admin/elections", {
        title: "Admin Dashboard",
        liveElections,
        elections,
        csrfToken: req.csrfToken(),
      });
    } else {
      res.json({
        liveElections,
        elections,
      });
    }
  }
);

router.get(
  "/election/:id",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/admin/" }),
  async (req, res) => {
    // console.log(req.params.id);
    const EID = req.params.id;
    const UID = req.user.id;
    const doesElectionBelongToUser = await Elections.isElectionbelongstoUser({
      EId: EID,
      UId: UID,
    });
    const voterCount = await Voters.getAllVotersofElection({
      EId: EID,
      UId: UID,
    });
    const questionCount = await Question.getAllQuestionsofElection({
      EId: EID,
      UId: UID,
    });
    try {
      if (doesElectionBelongToUser.success) {
        const election = await Elections.getElection({ EId: EID });
        // console.log(election)
        res.render("admin/election", {
          title: "Election " + election.electionName,
          election,
          voterCount: voterCount.length,
          questionCount: questionCount.length,
          csrfToken: req.csrfToken(),
        });
      } else {
        req.flash("error", doesElectionBelongToUser.message);
        res.redirect("/admin/elections");
      }
    } catch (error) {
      req.flash(
        "error",
        error.errors.map((error) => error.message)
      );
      res.redirect("/admin/elections");
    }
  }
);

router.post(
  "/election",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/admin/" }),
  async (req, res) => {
    const election = {
      electionName: req.body.name,
      customString: req.body.cstring,
      UId: req.user.id,
    };
    election.customString =
      election.customString === "" ? null : election.customString;
    try {
      if (election.customString !== null) {
        if (
          election.customString.match(
            "^[a-zA-Z]+[a-z0-9A-Z]+(?:(?:-|_)+[a-z0-9A-Z]+)*$"
          )
        ) {
          await Elections.createElection(election);
          res.redirect("/admin/elections");
        } else {
          req.flash(
            "error",
            "Custom string should only contain alphanumeric characters and should start with a letter"
          );
          res.redirect("/admin/elections");
        }
      } else {
        await Elections.createElection(election);
        res.redirect("/admin/elections");
      }
    } catch (error) {
      console.log(error);
      req.flash(
        "error",
        error.errors.map((error) => error.message)
      );
      console.log(error.errors.map((error) => error.message));
      res.redirect("/admin/elections");
    }
  }
);

router.delete(
  "/elections/:id",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/admin/" }),
  async (req, res) => {
    console.log("Deleting election");
    const EID = req.params.id;
    const UID = req.user.id;
    const doesElectionBelongToUser = await Elections.isElectionbelongstoUser({
      EId: EID,
      UId: UID,
    });
    try {
      if (doesElectionBelongToUser.success) {
        await Elections.deleteElection({ EId: EID });
        return res.status(200).json({
          success: true,
        });
      } else {
        res.status(401).json({
          success: false,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
      });
    }
  }
);

router.get(
  "/election/voters/:id",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/admin/" }),
  async (req, res) => {
    const EId = req.params.id;
    const UId = req.user.id;
    try {
      const isUserElection = await Elections.isElectionbelongstoUser({
        EId,
        UId,
      });
      if (isUserElection.success) {
        const voters = await Voters.getAllVotersofElection({
          EId,
          UId,
        });
        if (req.accepts("html")) {
          try {
            res.render("admin/voters", {
              title: "Admin Dashboard",
              voters,
              EID: EId,
              election: isUserElection,
              csrfToken: req.csrfToken(),
            });
          } catch (error) {
            console.log(error);
            res.status(500).json(error);
          }
        } else {
          res.json({
            voters,
            EId,
          });
        }
      } else {
        req.flash("error", isUserElection.message);
        res.redirect("/admin/elections");
      }
    } catch {
      (error) => {
        console.log(error);
        req.flash(
          "error",
          `Something went wrong, Pls try again later ${error}`
        );
        res.redirect("/admin/elections");
      };
    }
  }
);

router.post(
  "/election/voters",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/admin/" }),
  async (req, res) => {
    const EId = req.body.EId;
    const UId = req.user.id;
    const voter = {
      voterid: req.body.voterID,
      password: req.body.password,
      votername: req.body.votername,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      EId: req.body.EId,
    };
    try {
      const isUserElection = await Elections.isElectionbelongstoUser({
        EId,
        UId,
      });
      if (isUserElection.success && !isUserElection.ended) {
        try {
          // console.log(voter)
          await Voters.createVoter(voter);
          res.redirect(`/admin/election/voters/${EId}`);
        } catch (error) {
          console.log(error);
          req.flash(
            "error",
            error.errors.map((error) => error.message)
          );
          res.redirect("/admin/election/voters/" + EId);
        }
      } else {
        console.log("Unauthorized Access");
        req.flash(
          "error",
          isUserElection.ended ? "Election Ended" : "Unauthorized Access"
        );
        res.redirect("/admin/elections");
      }
    } catch (error) {
      console.log(error);
      req.flash(
        "error",
        error.errors.map((error) => error.message)
      );
      console.log("Redirecting to /admin/elections");
      res.redirect("/admin/elections/voters/" + EId);
    }
  }
);

router.delete(
  "/election/voters/:eid/:vid",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/admin/" }),
  async (req, res) => {
    const voterId = req.params.vid;
    const EId = req.params.eid;
    const UId = req.user.id;
    const doesElectionBelongToUser = await Elections.isElectionbelongstoUser({
      EId,
      UId,
    });
    try {
      if (doesElectionBelongToUser.success) {
        const voter = await Voters.findByPk(voterId);
        if (voter) {
          await Voters.remove(voter.id, EId);
          return res.status(200).json({
            success: true,
          });
        } else {
          res.status(404).json({
            success: false,
          });
        }
      } else {
        res.status(401).json({
          success: false,
        });
      }
    } catch (error) {
      console.log(error);
      req.flash(
        "error",
        error.errors.map((error) => error.message)
      );
      res.redirect("/admin/election/voters");
    }
  }
);

router.get(
  "/election/questions/:id",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/admin" }),
  async (req, res) => {
    console.log("Question Route accessed");
    const EID = req.params.id;
    const UId = req.user.id;
    try {
      const isUserElection = await Elections.isElectionbelongstoUser({
        EId: EID,
        UId,
      });
      if (isUserElection.success && !isUserElection.isLive) {
        const questions = await Question.getAllQuestionsofElection({
          EId: EID,
          UId,
        });
        for (let i = 0; i < questions.length; i++) {
          questions[i].options = await Option.getAllOptionsOfQuestion({
            QId: questions[i].id,
            UId,
          });
        }
        if (req.accepts("html")) {
          res.render("admin/questions", {
            title: `Questions of Election ${EID}`,
            csrfToken: req.csrfToken(),
            questions,
            election: isUserElection,
            EID: EID,
          });
        } else {
          res.json({
            questions,
            EID,
          });
        }
      } else {
        req.flash("error", isUserElection.message);
        res.redirect("/admin/elections");
      }
    } catch {
      (err) => {
        console.log(err);
        req.flash("error", `Something went wrong, Pls try again later ${err}`);
        res.redirect("/admin/elections");
      };
    }
  }
);

router.post("/election/questions", async (req, res) => {
  const EID = req.body.EID;
  const UId = req.user.id;
  const question = {
    title: req.body.title,
    desc: req.body.desc,
    EId: req.body.EID,
  };
  const options = req.body.options;
  try {
    const isUserElection = await Elections.isElectionbelongstoUser({
      EId: EID,
      UId,
    });
    if (isUserElection.success && !isUserElection.ended) {
      if (!isUserElection.isLive) {
        try {
          const newQuestion = await Question.createQuestion(question);
          for (let i = 0; i < options.length; i++) {
            await Option.createOption({
              desc: options[i],
              QId: newQuestion.id,
            });
          }
          req.flash("success", "Question Added Successfully");
          res.redirect(`/admin/election/questions/${EID}`);
        } catch {
          (error) => {
            console.log(error);
            req.flash(
              "error",
              error.errors.map((error) => error.message)
            );
            res.redirect(`/admin/election/quesitons/${EID}`);
          };
        }
      } else {
        console.log("Election is already live");
        req.flash("error", "Election is already live");
        res.redirect(`/admin/election/questions/${EID}`);
      }
    } else {
      console.log("Unauthorized Access");
      req.flash(
        "error",
        isUserElection.ended ? "Election Ended" : "Unauthorized Access"
      );
      res.redirect("/admin/elections");
    }
  } catch {
    (error) => {
      console.log(error);
      req.flash(
        "error",
        error.errors.map((error) => error.message)
      );
      res.redirect(`/admin/elections`);
    };
  }
});

router.delete(
  "/election/question/:id/:QID",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/admin" }),
  async (req, res) => {
    console.log("Delete Question Route Accessed");
    const EID = req.params.id;
    const UID = req.user.id;
    const QID = req.params.QID;
    const doesElectionBelongToUser = await Elections.isElectionbelongstoUser({
      EId: EID,
      UId: UID,
    });
    try {
      if (doesElectionBelongToUser.success) {
        await Question.deleteQuestion({ QId: QID, EID });
        return res.status(200).json({
          success: true,
        });
      } else {
        res.status(401).json({
          success: false,
        });
      }
    } catch {
      (error) => {
        console.log(error);
        res.status(500).json({
          success: false,
        });
      };
    }
  }
);

router.put(
  "/election/launch/:id",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/admin" }),
  async (req, res) => {
    console.log("Launch Election Route Accessed");
    const EID = req.params.id;
    const UID = req.user.id;
    try {
      const doesElectionBelongToUser = await Elections.isElectionbelongstoUser({
        EId: EID,
        UId: UID,
      });
      if (
        doesElectionBelongToUser.success &&
        !doesElectionBelongToUser.isLive &&
        !doesElectionBelongToUser.ended
      ) {
        const questionCount = await Question.getAllQuestionsofElection({
          EId: EID,
          UId: UID,
        });
        if (questionCount.length >= 1) {
          await Elections.launchElection({ EId: EID, UId: UID });
          res.json({
            success: true,
          });
        } else {
          res.json({
            success: false,
            message: "Election must have atleast 1 question to launch Election",
          });
        }
      } else {
        res.status(401).json({
          success: false,
          ended: doesElectionBelongToUser.ended,
        });
      }
    } catch {
      (error) => {
        console.log(error);
        res.status(500).json({
          success: false,
        });
      };
    }
  }
);

router.put(
  "/election/stop/:id",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/admin" }),
  async (req, res) => {
    const EID = req.params.id;
    const UID = req.user.id;
    try {
      const doesElectionBelongToUser = await Elections.isElectionbelongstoUser({
        EId: EID,
        UId: UID,
      });
      console.log(doesElectionBelongToUser);
      if (
        doesElectionBelongToUser.success &&
        doesElectionBelongToUser.isLive &&
        !doesElectionBelongToUser.ended
      ) {
        await Elections.endElection({ EId: EID, UId: UID });
        res.json({
          success: true,
        });
      } else {
        res.json({
          success: false,
          message: doesElectionBelongToUser.ended
            ? "Election is already Ended"
            : "Election is not live",
        });
      }
    } catch {
      (error) => {
        console.log(error);
        res.status(500).json({
          success: false,
        });
      };
    }
  }
);

router.get(
  "/election/result/:id",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/admin" }),
  async (req, res) => {
    const EID = req.params.id;
    const UID = req.user.id;
    try {
      const doesElectionBelongToUser = await Elections.isElectionbelongstoUser({
        EId: EID,
        UId: UID,
      });
      if (doesElectionBelongToUser.success) {
        const questions = await Question.getAllQuestionsofElection({
          EId: EID,
          UId: UID,
        });
        let result = [];
        for (let i = 0; i < questions.length; i++) {
          const question = questions[i];
          const options = await Option.getAllOptionsOfQuestion({
            QId: question.id,
          });
          let optionResult = [];
          let count = 0;
          for (let j = 0; j < options.length; j++) {
            const option = options[j];
            const votes = await Vote.getVotesOfOption({ OID: option.id });
            count += votes.length;
            optionResult.push({
              option: option,
              votes: votes.length,
            });
          }
          result.push({
            votes: count,
            question: question,
            options: optionResult,
          });
        }
        res.render("admin/result", {
          EID: EID,
          results: result,
          title: "Election Result",
          csrfToken: req.csrfToken(),
        });
      } else {
        req.flash("error", "Unauthorized Access");
        res.redirect("/admin/elections");
      }
    } catch {
      (error) => {
        console.log(error);
      };
    }
  }
);

module.exports = router;
