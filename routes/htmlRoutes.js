const router = require("express").Router();
const checkAuth = require("../middleware/auth");
const posts = require("../controllers/posts");
const connection = require("../config/connection");

// fetches any posts that exist in the database
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

    const posts = await getAllPosts();
    res.render("index", {
      isLoggedIn,
      username,
      posts,
    });

  } catch (err) {
    res.status(500).send("Error fetching posts");
  }
});


router.get("/login", async (req, res) => {
  if (req.session.isLoggedIn) return res.redirect("/");
  res.render("login", { error: req.query.error });
});

router.get("/signup", async (req, res) => {
  if (req.session.isLoggedIn) return res.redirect("/");
  res.render("signup", { error: req.query.error });
});

router.get("/private", checkAuth, ({ session: { isLoggedIn } }, res) => {
  res.render("protected", { isLoggedIn });
});


// render the form for the post
router.get("/create-post", posts.renderCreatePostForm);

// "forum-content" view
router.get("/forum-content", async (req, res) => {
  try {
    // Query the database to get all posts
    const query = "SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id";
    const [results] = await connection.query(query);

    // Pass the posts data to the "forum-content" template
    res.render("forum-content", { posts: results });
  } catch (err) {
    res.status(500).send("Error fetching posts");
  }
});

// POST forum-posting route
router.post("/create", checkAuth, (req, res) => {
  console.log("req.session.user:", req.session.user)
  posts.createPost(req, res, req.session.user);
});

module.exports = router;
