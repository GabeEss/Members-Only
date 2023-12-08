const Message = require("../models/message");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");

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
  res.send("NOT IMPLEMENTED: message create GET");
});

// Handle message create on POST.
exports.message_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: message create POST");
});

// Display message delete form on GET.
exports.message_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: message delete GET");
});

// Handle message delete on POST.
exports.message_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: message delete POST");
});

// Display message update form on GET.
exports.message_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: message update GET");
});

// Handle message update on POST.
exports.message_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: message update POST");
});
