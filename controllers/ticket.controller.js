const nodemailer = require("nodemailer");
const { client } = require("../config/db");

const sendEmail = async (recipient, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true, // true for 465
    auth: {
      user: "helpdeskbizzkonn@gmail.com",
      pass: "uijy ikrb lepx cdrc", // Use App Password here
    },
  });

  // Set up email data
  const mailOptions = {
    from: '"helpdeskbizzkonn@gmail.com', // Sender address
    to: recipient, // List of recipients
    subject: subject, // Subject line
    text: message, // Plain text body
  };

  return transporter.sendMail(mailOptions);
};

async function sendTicketEmail(to, ticketData) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true, // true for 465
    auth: {
      user: "helpdeskbizzkonn@gmail.com",
      pass: "uijy ikrb lepx cdrc", // Use App Password here
    },
  });

  const subject = "Your Helpdesk Support Ticket Details";
  const message = `
      <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #00e676;">Your Support Ticket</h2>
          <p>Thank you for submitting your ticket! Below are the details:</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); max-width: 600px; margin: 20px auto;">
              <p><strong>Issue Type:</strong> ${ticketData.issue_type}</p>
              <p><strong>Name:</strong> ${ticketData.name}</p>
              <p><strong>Email:</strong> ${ticketData.email}</p>
              <p><strong>Priority:</strong> ${ticketData.priority}</p>
              <p><strong>Branch Code:</strong> ${ticketData.branchcode}</p>
              <p><strong>Address:</strong> ${ticketData.address}</p>
              <p><strong>User Code:</strong> ${ticketData.user_code}</p>
              <p><strong>Subject:</strong> ${ticketData.subject}</p>
              <p><strong>Message:</strong> ${ticketData.message}</p>
              ${
                ticketData.attachment1
                  ? `<p><strong>Attachment:</strong> <a href="http://localhost:3000/uploads/${ticketData.attachment1}">${ticketData.attachment1}</a></p>`
                  : ""
              }
              <p><strong>Ticket ID:</strong> ${ticketData.ticket_id}</p>
              <p><strong>Submission Date:</strong> ${new Date(
                ticketData.submission_date
              ).toLocaleString()}</p>
          </div>
          <p style="text-align: center;">Track your ticket at <a href="http://localhost:3000/trace.html">Track Your Ticket</a></p>
      </body>
      </html>
  `;

  const mailOptions = {
    from: "helpdeskbizzkonn@gmail.com", // Replace with your email
    to: to,
    subject: subject,
    html: message,
  };

  try {
    const response = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", response.messageId);
    return response;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
}

const apiticket = async (req, res) => {
  const query = `
      SELECT id, issue_type, name, email, priority, branchcode, address, 
             user_code, subject, message, attachment1, datetime, status 
      FROM support_tickets 
      ORDER BY datetime DESC
  `;

  try {
    const result = await client.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching tickets:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

const deleteticket = async (req, res) => {
  const ticketId = req.params.id;
  const sql = "DELETE FROM support_tickets WHERE id = $1";

  try {
    const result = await client.query(sql, [ticketId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json({ message: "Ticket deleted successfully" });
  } catch (err) {
    console.error("Database error:", err.message);
    return res.status(500).json({ error: "Database error" });
  }
};

const delalltic = async (req, res) => {
  const sql = "TRUNCATE TABLE support_tickets RESTART IDENTITY CASCADE;";
  try {
    const result = await client.query(sql);
    res.json({
      message: "All tickets deleted successfully",
      deletedCount: result.rowCount,
    });
  } catch (err) {
    console.error("Error deleting all tickets:", err.message);
    return res.status(500).json({ error: "Database error: " + err.message });
  }
};

const sendannoucement = async (req, res) => {
  const { emails, subject, message } = req.body;
  if (!emails || !subject || !message) {
    return res
      .status(400)
      .json({ message: "Emails, subject, and message are required." });
  }

  try {
    const emailArray = [...new Set(Array.isArray(emails) ? emails : [emails])];
    const promises = emailArray.map((email) =>
      sendEmail(email, subject, message)
    );
    await Promise.all(promises);
    res.json({ message: "Announcements sent successfully!" });
  } catch (error) {
    console.error("Error in send-announcement endpoint:", error.message);
    res
      .status(500)
      .json({ message: "Error sending announcements: " + error.message });
  }
};

const submitticket = async (req, res) => {
  const {
    issue_type,
    name,
    email,
    priority,
    branchcode,
    address,
    user_code,
    subject,
    message,
  } = req.body;
  console.log(req.body);
  const uploadedImage = req.file ? req.file.path : null; // Get the uploaded image path
  if (!req.file) {
    return res.status(400).json(new ApiError(400, "An image is required."));
  }
  if (
    !issue_type ||
    !name ||
    !email ||
    !priority ||
    !branchcode ||
    !address ||
    !user_code ||
    !subject ||
    !message
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const branchcodeInt = parseInt(branchcode, 10);
  if (isNaN(branchcodeInt)) {
    return res.status(400).json({ message: "Branch code must be a number." });
  }

  const sql = `
      INSERT INTO support_tickets (
          issue_type, name, email, priority, branchcode, address, user_code, subject, message,attachment1, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10, 'Under Working') RETURNING id
  `;
  const values = [
    issue_type,
    name,
    email,
    priority,
    branchcodeInt,
    address,
    user_code,
    subject, // Save the image path in the database
    message,
    uploadedImage,
  ];

  try {
    const { rows } = await client.query(sql, values); // Using pg client to execute the query

    const ticket_id = rows[0].id; // Get the inserted ticket_id
    const ticketData = {
      issue_type,
      name,
      email,
      priority,
      branchcode: branchcodeInt,
      address,
      user_code,
      subject,
      message,
      ticket_id,
      submission_date: new Date(),
    };

    await sendTicketEmail(email, ticketData);
    res.json({
      message: "Ticket submitted and email sent successfully!",
      ticket_id,
    });
  } catch (error) {
    console.error("Error in ticket submission:", error.message);
    res
      .status(500)
      .json({ message: "Error submitting ticket: " + error.message });
  }
};

const apirecord = async (req, res) => {
  const staffQuery = "SELECT name, email, password FROM staff";
  const bankersQuery = "SELECT username, email, password FROM bankers";
  const adminsQuery =
    "SELECT admin_name, admin_email, admin_password FROM admins";

  try {
    const [staff, bankers, admins] = await Promise.all([
      client.query(staffQuery).then((result) => result.rows),
      client.query(bankersQuery).then((result) => result.rows),
      client.query(adminsQuery).then((result) => result.rows),
    ]);

    // Send the results as a JSON response
    res.json({ staff, bankers, admins });
  } catch (err) {
    console.error("Error fetching records:", err.message);
    res.status(500).json({ error: "Database error: " + err.message });
  }
};

const trackticket = async (req, res) => {
  const { email, ticket_id } = req.body;

  if (!email || !ticket_id) {
    return res
      .status(400)
      .json({ message: "Email and Ticket ID are required." });
  }

  const sql = "SELECT * FROM support_tickets WHERE email = $1 AND id = $2";

  try {
    const result = await client.query(sql, [email, ticket_id]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No ticket found with this email and ticket ID." });
    }

    res.json(result.rows[0]); // Send the first matching row
  } catch (err) {
    console.error("Database query error:", err.message);
    return res
      .status(500)
      .json({ message: "Error retrieving ticket: " + err.message });
  }
};

const resolveticket = async (req, res) => {
  const ticketId = req.params.ticket_id;
  const sql = "UPDATE support_tickets SET status = $1 WHERE id = $2";
  const status = "Request Resolved";
  try {
    const result = await client.query(sql, [status, ticketId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json({ message: "Ticket resolved successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Database error: " + err.message });
  }
};

const searchbybranchcode = async (req, res) => {
  const branchcode = req.params.branchcode;
  if (!branchcode) {
    return res.status(400).json({ message: "Branch code is required." });
  }
  const sql = "SELECT * FROM support_tickets WHERE branchcode = $1";

  try {
    const result = await client.query(sql, [branchcode]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No tickets found for this branch code." });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Database query error:", err.message);
    return res
      .status(500)
      .json({ message: "Error retrieving tickets: " + err.message });
  }
};

const closeticket = async (req, res) => {
  const ticketId = req.params.ticket_id;
  const sql = "UPDATE support_tickets SET status = $1 WHERE id = $2";
  const status = "Under Working";
  try {
    const result = await client.query(sql, [status, ticketId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json({ message: "Ticket closed successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Database error: " + err.message });
  }
};

module.exports = {
  apiticket,
  sendTicketEmail,
  deleteticket,
  delalltic,
  sendannoucement,
  submitticket,
  apirecord,
  trackticket,
  resolveticket,
  searchbybranchcode,
  sendEmail,
  closeticket,
};
