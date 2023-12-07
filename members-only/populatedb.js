#! /usr/bin/env node

console.log(
    'This script populates some users and messages into the database.'
  );
  
  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  
  const Message = require("./models/message");
  const User = require("./models/user");
  
  const messages = [];
  const users = [];
  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false);
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createUsers();
    await createMessages();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
  
  async function userCreate(index, username, password) {
    const user = new User({ 
        username: username,
        password: password,
    });
    await user.save();
    users[index] = user;
    console.log(`Added user: ${username}`);
  }
  
  async function messageCreate(index, title, text, timestamp, owner) {
    const message = new Message({ 
        title: title,
        text: text,
        timestamp: timestamp,
        owner: owner,
    });
  
    await message.save();
    messages[index] = message;
    console.log(`Added message: ${title}`);
  }
  
  async function createUsers() {
    console.log("Adding users");
    await Promise.all([
      userCreate(0, "newGuy1313", "Jajaja2918"),
      userCreate(1, "newGuy9363", "Zazaza9183"),
      userCreate(2, "memberGuy9347", "9182gfe7465"),
    ]);
  }
  
  async function createMessages() {
    console.log("Adding messages");
    await Promise.all([
      messageCreate(0, "A Message", "Hello, this is a message.", "2023-12-4", users[0]),
      messageCreate(1, "The Message", "Hello, this is the message.", "2023-12-4", users[1]),
      messageCreate(2, "A Hello", "Hello, this is a hello.", "2023-12-4", users[2]),
      messageCreate(3, "A Patrick", "No, this is Patrick.", "2023-12-4", users[2]),
    ]);
  }