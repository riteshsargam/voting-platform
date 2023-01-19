const router = require("express").Router();
const connectEnsureLogin = require("connect-ensure-login");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { Voters, Question, Option, Elections, Vote } = require("../models");

router.use(passport.initialize());
router.use(passport.session());

passport.use(
  "voterAuth",
  new LocalStrategy(
    {
      usernameField: "voterID",
      passwordField: "password",
    },
    async (voterID, password, done) => {
      // console.log("Authenticating User", voterID, password);
      Voters.findOne({ where: { voterid: voterID } })
        .then(async (user) => {
          // console.log("checking Password", user.password === password)
          const result = password === user.password;
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password 🤯" });
          }
        })
        .catch((err) => {
          console.log(err);
          return done(null, false, {
            message: "Invalid VoterID or You are not Registered with Us.",
          });
        });
    }
  )
);

router.get(
  "/",
  connectEnsureLogin.ensureLoggedOut({ redirectTo: "/voter/election" }),
  (req, res) => {
    res.render("voter/index", {
      title: "Voter Dashboard",
      csrfToken: req.csrfToken(),
    });
  }
);

router.get(
  "/login",
  connectEnsureLogin.ensureLoggedOut({ redirectTo: "/voter/election" }),
  (req, res) => {
    res.render("voter/login", {
      title: "Voter Login",
      csrfToken: req.csrfToken(),
    });
  }
);

router.post(
  "/login",
  connectEnsureLogin.ensureLoggedOut({ redirectTo: "/voter/election" }),
  passport.authenticate("voterAuth", {
    // successRedirect: "/voter/election",
    failureRedirect: "/voter/login",
    failureFlash: true,
  }),
  (req, res) => {
    console.log("Redirecting to Election Page");
    res.redirect("/voter/election");
  }
);

router.get(
  "/logout",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/voter" }),
  async (req, res) => {
    req.logout((err) => {
      if (err) {
        console.log(err);
      }
      req.flash("success", "Logged Out Successfully");
      res.redirect("/");
    });
  }
);

router.get(
  "/election",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/voter/login" }),
  async (req, res) => {
    const EID = req.user.EId;
    if (EID == null) {
      console.log("No Election Assigned");
      req.logout((err) => {
        if (err) {
          console.log(err);
        }
        res.redirect("/voter");
      });
    } else {
      const live = await Elections.isElectionLive({ EID });
      if (live.success) {
        const questions = await Question.getQuesionsOfElection({ EId: EID });
        const hasVoted = await Vote.hasVoted({
          VID: req.user.id,
          QID: questions[0].id,
        });
        if (hasVoted && !live.ended) {
          console.log("Already Voted");
          res.render("voter/alreadyVoted", {
            title: `Voting Election ${EID}`,
            EID: EID,
            ended: live.ended,
            csrfToken: req.csrfToken(),
          });
        } else {
          console.log("Voting");
          for (let i = 0; i < questions.length; i++) {
            questions[i].options = await Option.getAllOptionsOfQuestion({
              QId: questions[i].id,
            });
          }
          res.render("voter/VoteElection", {
            title: `Voting Election ${EID}`,
            EID: EID,
            questions: questions,
            ended: live.ended,
            csrfToken: req.csrfToken(),
          });
        }
      } else if (live.ended) {
        console.log("Election Ended");
        const questions = await Question.getQuesionsOfElection({ EId: EID });
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
        res.render("voter/alreadyVoted", {
          title: `Voting Election ${EID}`,
          EID: EID,
          ended: live.ended,
          csrfToken: req.csrfToken(),
          results: result,
        });
      } else {
        req.logout((err) => {
          if (err) {
            console.log(err);
          }
          req.flash("error", live.message);
          res.redirect("/voter");
        });
      }
    }
  }
);

router.post("/election", async (req, res) => {
  try {
    let questionVoted = [];
    if (typeof req.body.questions == "string") {
      questionVoted.push(req.body.questions);
    } else {
      questionVoted = req.body.questions;
    }
    const options = [];
    for (let i = 0; i < questionVoted.length; i++) {
      options.push(req.body[`option${i}`]);
    }
    if (questionVoted.length != options.length) {
      req.flash("error", "There was Some Issue, Please try Again !!!");
      res.redirect("/voter/election");
    } else {
      let checkOptionBelongsToQuestion = true;
      for (let i = 0; i < questionVoted.length; i++) {
        checkOptionBelongsToQuestion = (await Option.doesOptionBelongToQuestion(
          { QID: questionVoted[i], OID: options[i] }
        ))
          ? checkOptionBelongsToQuestion
          : false;
      }
      // console.log("Hello Something is Wrong", checkOptionBelongsToQuestion)
      if (checkOptionBelongsToQuestion) {
        // console.log(questionVoted, options, req.user.id)
        for (let i = 0; i < questionVoted.length; i++) {
          // console.log(questionVoted[i], options[i], req.user.id)
          let newVote = await Vote.createVote({
            QID: questionVoted[i],
            OID: options[i],
            VID: req.user.id,
          });
          if (newVote == null) {
            req.flash("error", "There was Some Issue, Please try Again !!!");
            res.redirect("/voter/election");
          }
        }
        req.flash("success", "Voted Successfully");
        res.redirect("/voter/election");
      } else {
        req.flash("error", "There was Some Issue, Please try Again !!!");
        res.redirect("/voter/election");
      }
    }
  } catch {
    (err) => {
      console.log(err);
      req.flash("error", "There was Some Issue, Please try Again !!!");
      res.redirect("/voter/election");
    };
  }
});

module.exports = router;
