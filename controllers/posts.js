const mysql = require('mysql2');
const connection = require("../config/connection");

// The functions here may be redundant with the functions in the htmlRoutes.js file...however I could not get the create/update post functions to work in the htmlRoutes.js file, so I added them here. I'm not sure if this is the best way to do it, but it works.

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

// UPDATE a post
async function updatePost(req, res, user, postId) {
    try {
        const userID = user.id;
        const { title, body } = req.body;

        // Check if the post being updated belongs to the logged-in user
        const selectQuery = "SELECT * FROM posts WHERE id = ? AND user_id = ?";
        const [postResults] = await connection.query(selectQuery, [postId, userID]);

        // the middleware should handle this with the req.session.user.id value and that should be passed in as the userID parameter. If the length of the results array is 0, then the post doesn't exist or doesn't belong to the user as defined by userID, so show an error... whew.
        if (postResults.length === 0) {
            return res.status(403).send("You are not authorized to update this post.");
        }

        // Update the post in the database
        const updateQuery = "UPDATE posts SET title = ?, body = ? WHERE id = ? AND user_id = ?";
        const values = [title, body, postId, userID];

        await connection.query(updateQuery, values);
        console.log("Post updated with ID: " + postId);

        res.redirect("/");

    } catch (err) {
        console.log("Error updating post: " + err);
        res.status(500).send("Error updating post");
    }
}

// render the form for the post on the "create-post" view
renderCreatePostForm = (req, res) => {
    res.render("create-post");
};

module.exports = {
    createPost,
    renderCreatePostForm,
    updatePost
};


