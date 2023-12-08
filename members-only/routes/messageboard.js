const express = require("express");
const router = express.Router();

// Require controller modules.
const user_controller = require("../controllers/userController");
const message_controller = require("../controllers/messageController");

// GET home page.
router.get("/", message_controller.index);

/// USER ROUTES ///

// GET request for creating a user. NOTE This must come before routes that display user (uses id).
router.get("/user/create", user_controller.user_create_get);

// POST request for creating user.
router.post("/user/create", user_controller.user_create_post);

// GET request for logging a user in.
router.get("/user/login", user_controller.user_login_get);

// POST request for logging a user in.
router.post("/user/login", user_controller.user_login_post);

// GET request for logging the user out
router.get('/user/logout', user_controller.user_logout_get);

// GET request to delete user.
router.get("/user/:id/delete", user_controller.user_delete_get);

// POST request to delete user.
router.post("/user/:id/delete", user_controller.user_delete_post);

// GET request to update user.
router.get("/user/:id/update", user_controller.user_update_get);

// POST request to update user.
router.post("/user/:id/update", user_controller.user_update_post);

// GET request for one user.
router.get("/user/:id", user_controller.user_detail);

// GET request for list of all user items.
router.get("/users", user_controller.user_list);

/// MESSAGE ROUTES ///

// GET request for creating message. NOTE This must come before route for id (i.e. display message).
router.get("/message/create", message_controller.message_create_get);

// POST request for creating message.
router.post("/message/create", message_controller.message_create_post);

// GET request to delete message.
router.get("/message/:id/delete", message_controller.message_delete_get);

// POST request to delete message.
router.post("/message/:id/delete", message_controller.message_delete_post);

// GET request to update message.
router.get("/message/:id/update", message_controller.message_update_get);

// POST request to update message.
router.post("/message/:id/update", message_controller.message_update_post);

// GET request for one message.
router.get("/message/:id", message_controller.message_detail);

// GET request for list of all messages.
router.get("/messages", message_controller.message_list);

module.exports = router;
