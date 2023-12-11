const Message = require("../models/message");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require('express-validator');

exports.index = asyncHandler(async (req, res, next) => {
    // Get details of user and message counts (in parallel)
    const [
        numUsers,
        numMessages,
    ] = await Promise.all([
        User.countDocuments({}).exec(),
        Message.countDocuments({}).exec(),
    ]);

    res.render("index", {
        title: "Members Only Home",
        user_count: numUsers,
        message_count: numMessages,
        c_user: req.user
    });
});

// Display list of all messages.
exports.message_list = asyncHandler(async (req, res, next) => {
  const allMessages = await Message.find({}, "title text timestamp owner")
    .sort({ title: 1 })
    .populate("owner")
    .exec();

  res.render("message_list", { title: "Message List", message_list: allMessages, c_user: req.user });
});

// Display detail page for a specific message.
exports.message_detail = asyncHandler(async (req, res, next) => {
  // Get details of message and retreive the owner.
  const message = await Message.findById(req.params.id).populate("owner").exec();
  if (message === null) {
    // No results.
    const err = new Error("message not found");
    err.status = 404;
    return next(err);
  }

  res.render("message_detail", {
    title: "Message Detail",
    message: message,
    c_user: req.user
  });
});

// Display message create form on GET.
exports.message_create_get = asyncHandler(async (req, res, next) => {
  res.render("message_form", { title: "Create Message", c_user: req.user })
});

// Handle message create on POST.
exports.message_create_post = [
    // Validate and sanitize the username field.
    body("title")
      .trim()
      .isLength({ min: 8 })
      .escape()
      .withMessage("Title must be at least 8 characters."),
    body("text")
      .trim()
      .isLength({ min: 8 })
      .escape()
      .withMessage("Message must be at least 8 characters."),

    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render("message_form", {
          title: "Create Message",
          c_user: req.user,
          errors: errors.array(),
          message: req.body // Pass the entered values back to the form
        });
        return;
      }

      const message = new Message({
        title: req.body.title,
        text: req.body.text,
        timestamp: new Date(),
        owner: req.user
      })

      // Save the message to the database.
      await message.save();

      // Redirect to the message detail page.
      res.redirect(message.url);
  })    
];

// Display message delete form on GET.
exports.message_delete_get = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id).populate("owner").exec();

  if (message === null) {
    // No results.
    const err = new Error("Message not found");
    err.status = 404;
    return next(err);
  }

  res.render("message_delete", {
    title: "Delete Message",
    message: message,
    c_user: req.user,
  });
});

// Handle message delete on POST.
exports.message_delete_post = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id).populate("owner").exec();

  if (!message.owner.equals(req.user._id)) {
    // User is not the owner of the original message. Redirect or handle accordingly.
    res.status(403).send("Unauthorized");
    return;
  }

  if (message === null) {
    // No results.
    const err = new Error("Message not found");
    err.status = 404;
    return next(err);
  } else {
    await Message.findByIdAndDelete(req.body.messageid);
    res.redirect("/");
  }
});

// Display message update form on GET.
exports.message_update_get = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id).populate("owner").exec();

  if (message === null) {
    // No results.
    const err = new Error("Message not found");
    err.status = 404;
    return next(err);
  }

  res.render("message_form", {
    title: "Update Message",
    message: message,
    c_user: req.user,
  });
});

// Handle message update on POST.
exports.message_update_post = [
  // Validate and sanitize fields.
  body("title")
    .trim()
    .isLength({ min: 8 })
    .escape()
    .withMessage("Title must be at least 8 characters."),
  body("text")
    .trim()
    .isLength({ min: 8 })
    .escape()
    .withMessage("Message must be at least 8 characters."),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Check if the current user is the owner of the original message
    const originalMessage = await Message.findById(req.params.id);

    if (!originalMessage || !originalMessage.owner.equals(req.user._id)) {
      // User is not the owner of the original message. Redirect or handle accordingly.
      res.status(403).send("Unauthorized");
      return;
    }

    // Create a Message object with escaped/trimmed data and old id.
    const message = new Message({
        title: req.body.title,
        text: req.body.text,
        timestamp: new Date(),
        owner: req.user,
        _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("message_form", {
        title: "Update Message",
        message: message,
        c_user: req.user,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedMessage = await Message.findByIdAndUpdate(req.params.id, message, {});
      // Redirect to message detail page.
      res.redirect(updatedMessage.url);
    }
  }),
];