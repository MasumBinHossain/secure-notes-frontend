
import { useEffect, useState } from "react";
import { apiRequest } from "./api";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    interests: "",
  });
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("notes");
  const [users, setUsers] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [posts, setPosts] = useState([]);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [userPosts, setUserPosts] = useState(null);

  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);

  const [notesPage, setNotesPage] = useState(1);
  const [notesTotalPages, setNotesTotalPages] = useState(1);

  const [postsPage, setPostsPage] = useState(1);
  const [postsTotalPages, setPostsTotalPages] = useState(1);

  const [interestGroups, setInterestGroups] = useState([]);
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    interests: "",
  });

  async function loadNotes() {
    try {
      const data = await apiRequest("/api/notes?page=1&limit=50");
      setNotes(data.notes || []);
    } catch (err) {
      setError(err.message);
    }
  }
  
  async function loadAdminData(page = 1, notesCurrentPage = 1) {
    try {
      const [usersData, notesData, groupsData] = await Promise.all([
        apiRequest(`/api/admin/users?page=${page}&limit=10`),
        apiRequest(`/api/admin/notes?page=${notesCurrentPage}&limit=10`),
        apiRequest("/api/admin/users/grouped-by-interests"),
      ]);

      setUsers(usersData.users || []);
      setAllNotes(notesData.notes || []);
      setInterestGroups(
        Array.isArray(groupsData) ? groupsData : groupsData.groups || []
      );

      setUserTotalPages(usersData.pagination?.totalPages || 1);
      setNotesTotalPages(notesData.pagination?.totalPages || 1);

      setUserPage(page);
      setNotesPage(notesCurrentPage);
    } catch (err) {
      setError(err.message);
    }
  }



  
  async function loadPosts(page = 1) {
    try {
      const data = await apiRequest(`/api/posts?page=${page}&limit=10`);

      setPosts(data.posts || []);
      setPostsTotalPages(data.pagination?.totalPages || 1);
      setPostsPage(page);
    } catch (err) {
      setError(err.message);
    }
  }


  async function createPost(e) {
    e.preventDefault();
    setError("");

    try {
      await apiRequest("/api/posts", {
        method: "POST",
        body: JSON.stringify({
          title: postTitle,
          content: postContent,
        }),
      });

      setPostTitle("");
      setPostContent("");
      await loadPosts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadUserPosts(userId) {
    try {
      const data = await apiRequest(`/api/posts/user/${userId}`);
      setUserPosts(data);
    } catch (err) {
      setError(err.message);
    }
  }



  async function createUser(e) {
    e.preventDefault();
    setError("");

    try {
      await apiRequest("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          ...adminForm,
          interests: adminForm.interests
            .split(",")
            .map((interest) => interest.trim().toLowerCase())
            .filter(Boolean),
        }),
      });

      setAdminForm({
        name: "",
        email: "",
        password: "",
        role: "user",
        interests: "",
      });

      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateUser(userId, updates) {
    try {
      await apiRequest(`/api/admin/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });

      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteUser(userId) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await apiRequest(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }


  useEffect(() => {
    loadPosts();

    if (user) {
      loadNotes();

      if (user.role === "admin") {
        loadAdminData();
      }
    }
  }, [user]);

  async function handleAuth(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";



      const requestBody =
        mode === "register"
          ? {
              ...form,
              interests: form.interests
                .split(",")
                .map((interest) => interest.trim().toLowerCase())
                .filter(Boolean),
            }
          : {
              email: form.email,
              password: form.password,
            };

      const data = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(requestBody),
      });



      if (mode === "register") {
        setMode("login");
        setError("Account created. Please log in.");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        setForm({ name: "", email: "", password: "" });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setNotes([]);
  }

  async function saveNote(e) {
    e.preventDefault();
    setError("");

    try {
      const body = JSON.stringify({ title, content });

      if (editingId) {
        await apiRequest(`/api/notes/${editingId}`, {
          method: "PUT",
          body,
        });
      } else {
        await apiRequest("/api/notes", {
          method: "POST",
          body,
        });
      }

      setTitle("");
      setContent("");
      setEditingId(null);
      await loadNotes();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteNote(id) {
    if (!window.confirm("Delete this note?")) return;

    try {
      await apiRequest(`/api/notes/${id}`, { method: "DELETE" });
      await loadNotes();
    } catch (err) {
      setError(err.message);
    }
  }

  function editNote(note) {
    setEditingId(note._id);
    setTitle(note.title);
    setContent(note.content);
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Secure Notes</h1>
        {user && (
          <div className="user-info">
            <span>{user.name} ({user.role})</span>
            <button onClick={logout} className="secondary">Logout</button>
          </div>
        )}
      </header>

      <main className="container">
        {error && <div className="message">{error}</div>}

        
        {!user ? (
          <>
            <section className="auth-card">
              <h2>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
              <p>Securely manage your personal notes.</p>

              <form onSubmit={handleAuth}>
                {mode === "register" && (
                  <input
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                )}

                

                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />

                <input
                  type="password"
                  placeholder="Password (minimum 8 characters)"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={8}
                  required
                />

                {mode === "register" && (
                  <>
                    <input
                      placeholder="Interests (optional)"
                      value={form.interests}
                      onChange={(e) =>
                        setForm({ ...form, interests: e.target.value })
                      }
                    />
                    <small className="field-hint">
                      Separate multiple interests with commas.
                      Example: programming, reading, chess.
                    </small>
                  </>
                )}

                <button disabled={loading}>
                  {loading
                    ? "Please wait..."
                    : mode === "login"
                      ? "Login"
                      : "Register"}
                </button>
              </form>

              <p className="switch">
                {mode === "login" ? "New here?" : "Already registered?"}
                <button
                  className="link-button"
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setError("");
                  }}
                >
                  {mode === "login" ? "Create account" : "Login"}
                </button>
              </p>
            </section>

            <section className="public-browse">
              <h2>Public Posts</h2>
              <p>Explore posts shared by our community. No login required.</p>

              {posts.length === 0 ? (
                <p>No public posts available yet.</p>
              ) : (
                <div className="notes-grid">
                  {posts.map((post) => (
                    <article className="note-card" key={post._id}>
                      <h3>{post.title}</h3>
                      <p>{post.content}</p>

                      <small>
                        By: {post.user?.name || "Unknown"}
                      </small>

                      <div className="form-actions">
                        <button
                          className="secondary"
                          onClick={() => {
                            const authorId = post.user?._id;

                            if (authorId) {
                              loadUserPosts(authorId);
                            }
                          }}
                        >
                          View Author's Posts
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className="pagination">
                <button
                  className="secondary"
                  disabled={postsPage <= 1}
                  onClick={() => loadPosts(postsPage - 1)}
                >
                  Previous
                </button>

                <span>
                  Page {postsPage} of {postsTotalPages}
                </span>

                <button
                  className="secondary"
                  disabled={postsPage >= postsTotalPages}
                  onClick={() => loadPosts(postsPage + 1)}
                >
                  Next
                </button>
              </div>

              {userPosts && (
                <div className="note-card author-posts">
                  <h3>Posts by {userPosts.name}</h3>

                  {userPosts.posts?.map((post) => (
                    <p key={post._id}>{post.title}</p>
                  ))}

                  <button
                    className="secondary"
                    onClick={() => setUserPosts(null)}
                  >
                    Close
                  </button>
                </div>
              )}
            </section>
          </>
        ) : (

          <section>
            <h2>My Notes</h2>
            <p>Create and manage your private notes.</p>
            
            <div className="admin-tabs">
              <button
                className={activeTab === "notes" ? "" : "secondary"}
                onClick={() => setActiveTab("notes")}
              >
                My Notes
              </button>

              {user.role === "admin" && (
                <button
                  className={activeTab === "admin" ? "" : "secondary"}
                  onClick={() => setActiveTab("admin")}
                >
                  Admin Dashboard
                </button>
              )}

              <button
                className={activeTab === "posts" ? "" : "secondary"}
                onClick={() => setActiveTab("posts")}
              >
                Public Posts
              </button>
            </div>

            {activeTab === "notes" && (
              <>
            <form className="note-form" onSubmit={saveNote}>
              <input
                placeholder="Note title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Write your note here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                required
              />
              <div className="form-actions">
                <button type="submit">
                  {editingId ? "Update Note" : "Add Note"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => {
                      setEditingId(null);
                      setTitle("");
                      setContent("");
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <h2 className="notes-heading">Your Notes ({notes.length})</h2>

            {notes.length === 0 ? (
              <p>No notes yet. Create your first note above.</p>
            ) : (
              <div className="notes-grid">
                {notes.map((note) => (
                  <article className="note-card" key={note._id}>
                    <h3>{note.title}</h3>
                    <p>{note.content}</p>
                    <div className="form-actions">
                      <button className="secondary" onClick={() => editNote(note)}>
                        Edit
                      </button>
                      <button className="danger" onClick={() => deleteNote(note._id)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
             </>
            )}

            
            {user.role === "admin" && activeTab === "admin" && (
              <div className="admin-dashboard">
                <h2>Admin Dashboard</h2>
                
              <div className="note-form">
                <h3>Create New User</h3>

                <form onSubmit={createUser}>
                  <input
                    placeholder="Full name"
                    value={adminForm.name}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, name: e.target.value })
                    }
                    required
                  />

                  <input
                    type="email"
                    placeholder="Email address"
                    value={adminForm.email}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, email: e.target.value })
                    }
                    required
                  />

                  <input
                    type="password"
                    placeholder="Password (minimum 8 characters)"
                    value={adminForm.password}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, password: e.target.value })
                    }
                    minLength={8}
                    required
                  />

                  <input
                    placeholder="Interests (optional)"
                    value={adminForm.interests}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, interests: e.target.value })
                    }
                  />

                  <small className="field-hint">
                    Separate multiple interests with commas. Example: programming, reading, chess.
                  </small>

                  <select
                    value={adminForm.role}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, role: e.target.value })
                    }
                  >
                    <option value="user">Regular User</option>
                    <option value="admin">Administrator</option>
                  </select>

                  <button type="submit">Create User</button>
                </form>
              </div>

                <div className="admin-stats">
                  <div className="stat-card">
                    <h3>{users.length}</h3>
                    <p>Total Users</p>
                  </div>

                  <div className="stat-card">
                    <h3>{allNotes.length}</h3>
                    <p>Total Notes</p>
                  </div>

                  <div className="stat-card">
                    <h3>{interestGroups.length}</h3>
                    <p>Interest Groups</p>
                  </div>
                </div>

                <h3>Registered Users</h3>

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {users.map((item) => (
                        <tr key={item._id}>
                          <td>{item.name}</td>
                          <td>{item.email}</td>
                          <td>{item.role}</td>
                          <td>
                            <button
                              className="secondary"
                              onClick={() => {
                                const newRole =
                                  item.role === "admin" ? "user" : "admin";

                                updateUser(item._id, { role: newRole });
                              }}
                            >
                              Change Role
                            </button>

                            <button
                              className="danger"
                              onClick={() => deleteUser(item._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pagination">
                  <button
                    className="secondary"
                    disabled={userPage <= 1}
                    onClick={() => loadAdminData(userPage - 1, notesPage)}
                  >
                    Previous
                  </button>

                  <span>
                    Page {userPage} of {userTotalPages}
                  </span>

                  <button
                    className="secondary"
                    disabled={userPage >= userTotalPages}
                    onClick={() => loadAdminData(userPage + 1, notesPage)}
                  >
                    Next
                  </button>
                </div>


                <h3>All Users' Notes</h3>

                {allNotes.map((note) => (
                  <article className="note-card" key={note._id}>
                    <h4>{note.title}</h4>
                    <p>{note.content}</p>
                    <small>
                      Owner: {note.user?.name || "Unknown"}
                    </small>
                  </article>
                ))}

                
                <div className="pagination">
                  <button
                    className="secondary"
                    disabled={notesPage <= 1}
                    onClick={() => loadAdminData(userPage, notesPage - 1)}
                  >
                    Previous
                  </button>

                  <span>
                    Page {notesPage} of {notesTotalPages}
                  </span>

                  <button
                    className="secondary"
                    disabled={notesPage >= notesTotalPages}
                    onClick={() => loadAdminData(userPage, notesPage + 1)}
                  >
                    Next
                  </button>
                </div>


                <h3>Users Grouped by Interests</h3>

                
                <div className="interest-groups-grid">
                  {interestGroups.length === 0 ? (
                    <p>No interest groups found.</p>
                  ) : (
                    interestGroups.map((group) => (
                      <article className="interest-card" key={group._id}>
                        <div className="interest-card-header">
                          <h4>{group._id}</h4>
                          <span className="interest-count">
                            {group.totalUsers ?? group.users?.length ?? 0} users
                          </span>
                        </div>

                        {group.users?.map((person, index) => (
                          <div
                            className="interest-user"
                            key={person.id || person._id || person.email || index}
                          >
                            <strong>{person.name}</strong>
                            <span>{person.email}</span>
                          </div>
                        ))}
                      </article>
                    ))
                  )}
                </div>



              </div>
            )}

        {activeTab === "posts" && (
          <div className="posts-section">
            <h2>Public Posts</h2>
            <p>Share your thoughts and explore posts from other users.</p>

            <form className="note-form" onSubmit={createPost}>
              <input
                placeholder="Post title"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                required
              />

              <textarea
                placeholder="Write something..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={4}
                required
              />

              <button type="submit">Publish Post</button>
            </form>

            <h3>Latest Posts ({posts.length})</h3>

            {posts.length === 0 ? (
              <p>No public posts yet.</p>
            ) : (
              <div className="notes-grid">
                {posts.map((post) => (
                  <article className="note-card" key={post._id}>
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                    <small>
                      By: {post.user?.name || "Unknown"}
                    </small>

                    <div className="form-actions">
                      <button
                        className="secondary"
                        onClick={() => loadUserPosts(post.user?._id)}
                      >
                        View Author's Posts
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}


            <div className="pagination">
              <button
                className="secondary"
                disabled={postsPage <= 1}
                onClick={() => loadPosts(postsPage - 1)}
              >
                Previous
              </button>

              <span>
                Page {postsPage} of {postsTotalPages}
              </span>

              <button
                className="secondary"
                disabled={postsPage >= postsTotalPages}
                onClick={() => loadPosts(postsPage + 1)}
              >
                Next
              </button>
            </div>


            {userPosts && (
              <div className="note-card">
                <h3>Posts by {userPosts.name}</h3>
                {userPosts.posts?.map((post) => (
                  <p key={post._id}>{post.title}</p>
                ))}
                <button
                  className="secondary"
                  onClick={() => setUserPosts(null)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}

          </section>
        )}
      </main>
    </div>
  );
}
