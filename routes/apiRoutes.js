const router = require("express").Router();
const controllers = require("../controllers");
const fetch = require('node-fetch');
const checkAuth = require("../middleware/auth");
const posts = require("../controllers/posts");
const connection = require("../config/connection");



// admin login/logout
router.post("/login", controllers.auth.login);
router.get("/logout", controllers.auth.logout);
router.post("/signup", controllers.user.create);

router.post("/random-fact", checkAuth, async (req, res) => {
    try {
        // Fetch a random fact from the API
        const response = await fetch("https://uselessfacts.jsph.pl/random.json?language=en");
        const data = await response.json();
        const randomFact = data.text;

        const userID = req.session.user.id; // Assuming you have the authenticated user ID in the session
        const title = req.body.title;
        const insertQuery = "INSERT INTO posts (title, body, user_id) VALUES (?, ?, ?)";
        const values = [title, randomFact, userID];

        // Save the post to the database
        const [results] = await connection.query(insertQuery, values);
        const postId = results.insertId;
        console.log("Post created with ID: " + postId);

        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error creating post with random fact" });
    }
});



module.exports = router;
