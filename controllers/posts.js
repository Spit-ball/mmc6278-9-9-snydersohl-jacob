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

        res.redirect("/");
    } catch (err) {
        console.log("Error creating posts: " + err);
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


