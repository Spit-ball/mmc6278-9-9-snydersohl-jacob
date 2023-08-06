const router = require("express").Router();
const checkAuth = require("../middleware/auth");
const posts = require("../controllers/posts");
const connection = require("../config/connection");

// fetches any posts that exist in the database & relates it to username
async function getAllPosts() {
  try {
    const query = "SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id";
    const [results] = await connection.query(query);
    return results;
  } catch (err) {
    console.error("Error fetching posts: ", err);
    return [];
  }
}

// modified the "/" route to fetch all posts and pass them to the "index" template even if there is no current user logged in.

router.get("/", async (req, res) => {
  try {
    const isLoggedIn = req.session.isLoggedIn || false;
    const username = isLoggedIn && req.session.user ? req.session.user.username : '';
    const userID = isLoggedIn && req.session.user ? req.session.user.id : null;

    const query = "SELECT posts.*, users.username, (posts.user_id = ?) AS belongsToCurrentUser FROM posts JOIN users ON posts.user_id = users.id";
    const [results] = await connection.query(query, [userID]);

    res.render("index", {
      isLoggedIn,
      username,
      posts: results, // Pass the posts data (including belongsToCurrentUser) to the "index" template
    });
  } catch (err) {
    res.status(500).send("Error fetching posts");
  }
});


router.get("/login", async (req, res) => {
  if (req.session.isLoggedIn)
    return res.redirect("/");
  res.render("login", { error: req.query.error });
});

router.get("/signup", async (req, res) => {
  if (req.session.isLoggedIn) return res.redirect("/");
  res.render("signup", { error: req.query.error });
});

router.get("/private", checkAuth, ({ session: { isLoggedIn } }, res) => {
  res.render("protected", { isLoggedIn });
});


// Render the form for the post
router.get("/create-post", posts.renderCreatePostForm);

// "forum-content" view
router.get("/forum-content", async (req, res) => {
  try {
    const userID = req.session.isLoggedIn ? req.session.user.id : null;

    const query = "SELECT posts.*, users.username, (posts.user_id = ?) AS belongsToCurrentUser FROM posts JOIN users ON posts.user_id = users.id";
    const [results] = await connection.query(query, [userID]);

    res.render("/", { posts: results });
  } catch (err) {
    res.status(500).send("Error fetching posts");
  }
});

// POST forum-posting route
router.post("/create", checkAuth, (req, res) => {
  console.log("req.session.user:", req.session.user)
  posts.createPost(req, res, req.session.user);
});

// Handle the update request for a specific post
router.get("/update/:postId", checkAuth, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userID = req.session.user.id;

    const selectQuery = "SELECT * FROM posts WHERE id = ? AND user_id = ?";
    const [postResults] = await connection.query(selectQuery, [postId, userID]);

    if (postResults.length === 0) {
      return res.status(403).send("You are not authorized to update this post.");
    }

    res.render("updatePostForm", { post: postResults[0] });

  } catch (err) {
    res.status(500).send("Error fetching post for update");
  }
});



// POST route to handle the actual update of the post
router.post("/update/:postId", checkAuth, (req, res) => {
  const postId = req.params.postId;
  posts.updatePost(req, res, req.session.user, postId);
});

router.get("/delete/:postId", checkAuth, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userID = req.session.user.id;

    const selectQuery = "SELECT * FROM posts WHERE id = ? AND user_id = ?";
    const [postResults] = await connection.query(selectQuery, [postId, userID]);

    if (postResults.length === 0) {
      return res.status(403).send("You are not authorized to delete this post.");
    }
    const deleteQuery = "DELETE FROM posts WHERE id = ?";
    await connection.query(deleteQuery, [postId]);

    res.redirect("/");
  } catch (err) {
    res.status(500).send("Error deleting post");
  }
});


module.exports = router;
