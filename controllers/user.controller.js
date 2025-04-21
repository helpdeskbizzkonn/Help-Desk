const { client } = require("../config/db");

const adminSignup = async (req, res) => {
  const { admin_email, admin_name, admin_password } = req.body;
  const admin_profile_photo = req.file?.path ?? null;
  console.log("Admin signup request:", admin_profile_photo);
  const sql =
    "INSERT INTO admins (admin_email, admin_name, admin_password, admin_profile_photo) VALUES ($1, $2, $3, $4) RETURNING id";

  try {
    const result = await client.query(sql, [
      admin_email,
      admin_name,
      admin_password,
      admin_profile_photo,
    ]);
    console.log("Admin registered:", { id: result.rows[0].id, admin_email });
    res.json({ message: "Admin Registered Successfully" });
  } catch (err) {
    console.error("Signup error:", err.message);
    return res.status(400).json({ error: err.message });
  }
};

const adminLogin = async (req, res) => {
  const { admin_email, admin_password } = req.body;
  if (!admin_email || !admin_password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const sql =
    "SELECT * FROM admins WHERE admin_email = $1 AND admin_password = $2";

  try {
    const results = await client.query(sql, [admin_email, admin_password]);
    if (results.rows.length === 0) {
      return res.status(401).json({ error: "Invalid Email or Password" });
    }

    console.log("Login successful:", { admin_email });
    res.json({
      message: "Login Successful",
      profile: results.rows[0].admin_profile_photo,
      adminName: results.rows[0].admin_name,
      adminEmail: results.rows[0].admin_email,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error: " + err.message });
  }
};

const admincheckemail = async (req, res) => {
  const { admin_email } = req.body;

  const sql = "SELECT * FROM admins WHERE admin_email = $1";

  try {
    const result = await client.query(sql, [admin_email]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Admin email not found" });
    }

    res.json({ message: "Email verified. You can reset your password." });
  } catch (err) {
    console.error("Database error:", err.message);
    return res.status(500).json({ message: "Database error" });
  }
};

const ForgotPassword = async (req, res) => {
  const { admin_email, newPassword, confirmPassword } = req.body;

  if (!admin_email || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const sql = "UPDATE admins SET admin_password = $1 WHERE admin_email = $2";

  try {
    await client.query(sql, [newPassword, admin_email]);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Error updating password:", err.message);
    return res.status(500).json({ message: "Error updating password" });
  }
};

const staffsingup = async (req, res) => {
  const { name, email, password } = req.body;

  const sql = "INSERT INTO staff (name, email, password) VALUES ($1, $2, $3)";

  try {
    await client.query(sql, [name, email, password]);
    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("Error registering user:", err.message);
    return res.json({ success: false, message: "Error registering user" });
  }
};

const stafflogin = async (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM staff WHERE email = $1 AND password = $2";

  try {
    const result = await client.query(sql, [email, password]);

    if (result.rowCount === 0) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    res.json({
      success: true,
      message: "Login successful",
      staffEmail: result.rows[0].email,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.json({ success: false, message: "Invalid credentials" });
  }
};

const staffcheckemail = async (req, res) => {
  const { email } = req.body;

  const sql = "SELECT * FROM staff WHERE email = $1";

  try {
    const result = await client.query(sql, [email]);

    if (result.rowCount === 0) {
      return res.json({ success: false, message: "Email not found" });
    }

    res.json({ success: true, message: "Email verified" });
  } catch (err) {
    console.error("Database error:", err.message);
    return res.json({ success: false, message: "Database error" });
  }
};

const staffresetpass = async (req, res) => {
  const { email, newPassword } = req.body;

  const sql = "UPDATE staff SET password = $1 WHERE email = $2";

  try {
    const result = await client.query(sql, [newPassword, email]);

    if (result.rowCount === 0) {
      return res.json({ success: false, message: "Email not found" });
    }

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err.message);
    return res.json({ success: false, message: "Error updating password" });
  }
};

const bankersignup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const checkSql = "SELECT * FROM bankers WHERE username = $1 OR email = $2";

  try {
    const checkResult = await client.query(checkSql, [username, email]);

    if (checkResult.rowCount > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Username or email already exists" });
    }

    const insertSql =
      "INSERT INTO bankers (username, email, password) VALUES ($1, $2, $3)";
    await client.query(insertSql, [username, email, password]);

    res.json({ success: true, message: "Banker account created successfully" });
  } catch (err) {
    console.error("Error creating banker account:", err.message);
    return res.status(500).json({ success: false, message: "Database error" });
  }
};

const bankerlogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  const sql = "SELECT * FROM bankers WHERE email = $1 AND password = $2";

  try {
    const result = await client.query(sql, [email, password]);

    if (result.rowCount === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    res.json({
      success: true,
      message: "Login successful",
      bankerEmail: result.rows[0].email,
    });
  } catch (err) {
    console.error("Database error:", err.message);
    return res.status(500).json({ success: false, message: "Database error" });
  }
};

const bankercheckemail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  const sql = "SELECT * FROM bankers WHERE email = $1";

  try {
    const result = await client.query(sql, [email]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Email not found" });
    }

    res.json({ success: true, message: "Email exists" });
  } catch (err) {
    console.error("Database error:", err.message);
    return res.status(500).json({ success: false, message: "Database error" });
  }
};

const bankerforgetpass = async (req, res) => {
  const { email, newpassword, confirmpassword } = req.body;

  if (!email || !newpassword || !confirmpassword) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  if (newpassword !== confirmpassword) {
    return res
      .status(400)
      .json({ success: false, message: "Passwords do not match" });
  }

  const checkSql = "SELECT * FROM bankers WHERE email = $1";

  try {
    const checkResult = await client.query(checkSql, [email]);

    if (checkResult.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Email not found" });
    }

    const updateSql = "UPDATE bankers SET password = $1 WHERE email = $2";
    console.log("Updating password:", email);
    await client.query(updateSql, [newpassword, email]);

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Error updating password" });
  }
};

const deletestaf = async (req, res) => {
  const email = req.params.email;
  console.log(`DELETE request for staff with email: ${email}`); // Debug log

  try {
    const result = await client.query(
      "DELETE FROM staff WHERE email = $1 RETURNING *",
      [email]
    );

    console.log(
      `Query result for staff deletion: affectedRows = ${result.rowCount}`
    ); // Debug log

    if (result.rowCount === 0) {
      console.log(`Staff not found for email: ${email}`);
      return res.status(404).json({ error: "Staff not found" });
    }

    console.log(`Staff deleted successfully: ${email}`);
    res.json({ message: "Staff account deleted successfully" });
  } catch (err) {
    console.error("Error deleting staff:", err); // Log full error object
    return res.status(500).json({ error: "Database error: " + err.message });
  }
};

const deletebanker = async (req, res) => {
  const email = req.params.email;
  console.log(`DELETE request for banker with email: ${email}`); // Debug log

  try {
    const result = await client.query(
      "DELETE FROM bankers WHERE email = $1 RETURNING *",
      [email]
    );

    console.log(
      `Query result for banker deletion: affectedRows = ${result.rowCount}`
    ); // Debug log

    if (result.rowCount === 0) {
      console.log(`Banker not found for email: ${email}`);
      return res.status(404).json({ error: "Banker not found" });
    }

    console.log(`Banker deleted successfully: ${email}`);
    res.json({ message: "Banker account deleted successfully" });
  } catch (err) {
    console.error("Error deleting banker:", err); // Log full error object
    return res.status(500).json({ error: "Database error: " + err.message });
  }
};

const deleteadmin = async (req, res) => {
  const email = req.params.email;
  console.log(`DELETE request for admin with email: ${email}`); // Debug log

  try {
    const result = await client.query(
      "DELETE FROM admins WHERE admin_email = $1 RETURNING *",
      [email]
    );

    console.log(
      `Query result for admin deletion: affectedRows = ${result.rowCount}`
    ); // Debug log

    if (result.rowCount === 0) {
      console.log(`Admin not found for email: ${email}`);
      return res.status(404).json({ error: "Admin not found" });
    }

    console.log(`Admin deleted successfully: ${email}`);
    res.json({ message: "Admin account deleted successfully" });
  } catch (err) {
    console.error("Error deleting admin:", err); // Log full error object
    return res.status(500).json({ error: "Database error: " + err.message });
  }
};

module.exports = {
  adminLogin,
  adminSignup,
  ForgotPassword,
  staffsingup,
  stafflogin,
  staffresetpass,
  bankersignup,
  bankerlogin,
  bankerforgetpass,
  bankercheckemail,
  staffcheckemail,
  admincheckemail,
  deletestaf,
  deletebanker,
  deleteadmin,
};
