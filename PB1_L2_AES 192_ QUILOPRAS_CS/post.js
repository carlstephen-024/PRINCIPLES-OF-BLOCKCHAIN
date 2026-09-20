/* PostIt Board - Script
   Handles:
   1. One-time collection of user info (no signup/login, no backend)
   2. Posting captions, rendered as a thread (newest first)
   3. AES-encrypting (username + post + date) for every post using CryptoJS
   4. Persisting both user info and posts in localStorage*/

/*localStorage keys*/
const USER_KEY = "LA POST_user";   // the one-time user info object
const POSTS_KEY = "LA POST_posts"; // the array of posts

/*Cache DOM elements*/
const userFormSection = document.getElementById("userFormSection");
const postSection = document.getElementById("postSection");
const userInfoForm = document.getElementById("userInfoForm");

const welcomeText = document.getElementById("welcomeText");
const resetUserBtn = document.getElementById("resetUserBtn");

const captionInput = document.getElementById("captionInput");
const charCount = document.getElementById("charCount");
const postBtn = document.getElementById("postBtn");

const thread = document.getElementById("thread");
const emptyState = document.getElementById("emptyState");

/*Helpers: read/write user info in localStorage*/
function getSavedUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveUser(userObj) {
  localStorage.setItem(USER_KEY, JSON.stringify(userObj));
}

/*Helpers: read/write posts array in localStorage*/
function getSavedPosts() {
  const raw = localStorage.getItem(POSTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function savePosts(postsArr) {
  localStorage.setItem(POSTS_KEY, JSON.stringify(postsArr));
}

/* AES Encryption
   The username, post, and date are combined into one stringified value,
   then AES-encrypted with CryptoJS (loaded from the Cloudflare cdnjs CDN).
   The user's own password is used as the AES passphrase.*/
function encryptPost(username, postText, dateString, secretKey) {
  // Build the plain payload to be encrypted
  const payload = JSON.stringify({
    username: username,
    post: postText,
    date: dateString,
  });

  // AES-encrypt the stringified payload and return it as a string
  const cipherText = CryptoJS.AES.encrypt(payload, secretKey).toString();
  return cipherText;
}

/*Build one post card for the thread*/
function renderPost(post) {
  // Container card for this individual post
  const card = document.createElement("div");
  card.className = "card post-card";

  // "ORIGINAL POST" label
  const originalLabel = document.createElement("span");
  originalLabel.className = "post-label";
  originalLabel.textContent = "ORIGINAL POST";
  card.appendChild(originalLabel);

  // The caption text itself
  const captionEl = document.createElement("p");
  captionEl.className = "post-caption";
  captionEl.textContent = post.post;
  card.appendChild(captionEl);

  // Meta line: who posted and when
  const metaEl = document.createElement("p");
  metaEl.className = "post-meta";
  metaEl.textContent = post.username + " — " + new Date(post.date).toLocaleString();
  card.appendChild(metaEl);

  // Encrypted value block, shown below the original post
  const encBlock = document.createElement("div");
  encBlock.className = "encrypted-block";

  const encLabel = document.createElement("span");
  encLabel.className = "encrypted-label";
  encLabel.textContent = "Encrypted (username + post + date)";
  encBlock.appendChild(encLabel);

  const encValue = document.createElement("span");
  encValue.className = "encrypted-value";
  encValue.textContent = post.encrypted;
  encBlock.appendChild(encValue);

  card.appendChild(encBlock);

  return card;
}

/*Render the full thread (newest post first)*/
function renderThread() {
  const posts = getSavedPosts();

  // Clear the thread before re-rendering
  thread.innerHTML = "";

  if (posts.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  // Stored oldest -> newest, so reverse a copy to show newest first
  const newestFirst = [...posts].reverse();
  newestFirst.forEach(function (post) {
    thread.appendChild(renderPost(post));
  });
}

/*Switch between Step 1 (user form) and Step 2 (posting UI)*/
function showPostingUI(user) {
  userFormSection.classList.add("hidden");
  postSection.classList.remove("hidden");
  welcomeText.textContent = "Welcome, " + user.fullName.split(" ")[0] + " (@" + user.username + ")";
  renderThread();
}

function showUserForm() {
  postSection.classList.add("hidden");
  userFormSection.classList.remove("hidden");
}

/*Event: submitting the one-time user info form*/
userInfoForm.addEventListener("submit", function (e) {
  e.preventDefault(); // stop the page from reloading

  // Collect all required fields into one user object
  const user = {
    fullName: document.getElementById("fullName").value.trim(),
    dob: document.getElementById("dob").value,
    yearLevel: document.getElementById("yearLevel").value,
    gender: document.getElementById("gender").value,
    username: document.getElementById("username").value.trim(),
    password: document.getElementById("password").value,
  };

  // Save so the user is only ever asked this ONE time
  saveUser(user);

  showPostingUI(user);
});

/*Event: "Not you?" clears the saved identity and shows the form again*/
resetUserBtn.addEventListener("click", function () {
  const confirmReset = confirm("This clears your saved info from this browser. Continue?");
  if (!confirmReset) return;

  localStorage.removeItem(USER_KEY);
  userInfoForm.reset();
  showUserForm();
});

/*Event: live character counter for the caption box*/
captionInput.addEventListener("input", function () {
  charCount.textContent = captionInput.value.length + " / 280";
});

/*Event: clicking "Post" adds a new entry to the thread */
postBtn.addEventListener("click", function () {
  const text = captionInput.value.trim();
  if (text === "") {
    captionInput.focus();
    return; // ignore empty posts
  }

  const user = getSavedUser();
  if (!user) {
    // Safety net: shouldn't happen, since posting only shows after the form
    showUserForm();
    return;
  }

  const dateString = new Date().toISOString();

  // Encrypt (username + post + date) using the password as the AES key
  const encryptedValue = encryptPost(user.username, text, dateString, user.password);

  // Build the post record and save it
  const posts = getSavedPosts();
  posts.push({
    username: user.username,
    post: text,
    date: dateString,
    encrypted: encryptedValue,
  });
  savePosts(posts);

  // Clear the composer and re-render with the new post on top
  captionInput.value = "";
  charCount.textContent = "0 / 280";
  renderThread();
});

/* Ctrl+Enter or Cmd+Enter inside the textarea also posts */
captionInput.addEventListener("keydown", function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    postBtn.click();
  }
});

/*On page load: restore the saved user if there is one*/
(function init() {
  const savedUser = getSavedUser();
  if (savedUser) {
    showPostingUI(savedUser);
  } else {
    showUserForm();
  }
})();