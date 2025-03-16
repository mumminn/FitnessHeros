const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");

router.get("/protected", verifyToken, (req, res) => {
  res
    .status(200)
    .json({ message: `Hello, ${req.user.id}. You have access to this route.` });
});

module.exports = router;
