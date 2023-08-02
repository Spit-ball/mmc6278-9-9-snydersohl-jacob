const mysql = require('mysql2');
const connection = require("../config/connection");

async function createPost(req, res, user) {
    try {
        const userID = user.id;
        const { title, body } = req.body;
        const insertQuery = "INSERT INTO posts (title, body, user_id) VALUES (?, ?, ?)";
        const values = [title, body, userID];

        const [results] = await connection.query(insertQuery, values);
        const postId = results.insertId;
        console.log("Post created with ID: " + postId);

        // Fetch the username of the user who created the post
        const getUserQuery = "SELECT username FROM users WHERE id = ?";
        const [userResults] = await connection.query(getUserQuery, [userID]);
        const username = userResults[0].username;

        // Now, render the "forum-content" page with the postId and username as query parameters
        res.redirect(`/forum-content?postId=${postId}&username=${username}`);
    } catch (err) {
        console.log("Error creating post: " + err);
        res.status(500).send("Error creating post");
    }
}

renderCreatePostForm = (req, res) => {
    res.render("create-post");
};

module.exports = {
    createPost,
    renderCreatePostForm
};


