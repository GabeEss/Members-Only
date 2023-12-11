const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");


// Display list of all users.
exports.user_list = asyncHandler(async (req, res, next) => {
  const allUsers = await User.find({}, "username")
    .sort({ username: 1 })
    .exec();

  res.render("user_list", { title: "User List", user_list: allUsers, c_user: req.user });
});

// Display detail page for a specific user.
exports.user_detail = asyncHandler(async (req, res, next) => {
  // Get details of user and retreive the owner.
  const user = await User.findById(req.params.id).exec();
  if (user === null) {
    // No results.
    const err = new Error("user not found");
    err.status = 404;
    return next(err);
  }

  res.render("user_detail", {
    title: "User Detail",
    user: user,
    c_user: req.user
  });
});

// Display user create form on GET.
exports.user_create_get = asyncHandler(async (req, res, next) => {
  res.render("user_form", { title: "Create User", c_user: req.user })
});

// Handle user create on POST.
exports.user_create_post = [
  // Validate and sanitize the username field.
  body("username")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("User name must be specified."),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .escape()
    .withMessage("Password with 8 characters required.")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number."),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    try {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
            // Handle the error (e.g., log it, send an error response)
            return next(err);
        }
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        
        const user = new User({ 
          username: req.body.username,
          password: hashedPassword
        });

        if (!errors.isEmpty()) {
          // There are errors. Render the form again with sanitized values/error messages.
          res.render("user_form", {
            title: "Create User",
            user: user,
            errors: errors.array(),
            c_user: req.user
          });
          return;
        } else {
          // Data from form is valid.
          // Check if user with same name already exists.
          const userExists = await User.findOne({ username: req.body.username }).exec();
          if (userExists) {
            // User exists, redirect to its detail page.
            res.redirect(userExists.url);
          } else {
            await user.save();
            console.log("user created");
            
            req.login(user, (loginErr) => {
              if (loginErr) {
                console.error("Error during login:", loginErr);
                return next(loginErr);
              }
              res.redirect("/");
            });
          }
        }
    })} catch (err) {
      return next(err);
    }
  }),
];

// Display login form as user on GET.
exports.user_login_get = asyncHandler(async (req, res, next) => {
  res.render("user_login", { title: "User Login", c_user: req.user })
});

// Handle user login on POST.
exports.user_login_post = asyncHandler(async (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      // Authentication failed
      const errorMessage = 'Incorrect username or password';
      return res.render('user_login', { title: 'User Login', c_user: req.user, errorMessage: errorMessage });
    }
    // Authentication successful, log in the user
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      // Redirect to the home page or another success page
      return res.redirect('/');
    });
  })(req, res, next);
});

// Handle user logout on GET
exports.user_logout_get = asyncHandler(async (req, res, next) => {
    // Using req.logout with a callback function
    req.logout((err) => {
      if (err) {
          return next(err);
      }
      res.redirect("/");
  });
});

// Display user delete form on GET.
exports.user_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: user delete GET");
});

// Handle user delete on POST.
exports.user_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: user delete POST");
});

// Display user update form on GET.
exports.user_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: user update GET");
});

// Handle user update on POST.
exports.user_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: user update POST");
});
