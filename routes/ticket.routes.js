const express = require("express");
const ticketController = require("../controllers/ticket.controller");
const upload = require("../middlewares/multermiddleware");
const router = express.Router();

router.get("/api/tickets", ticketController.apiticket);

router.delete("/api/tickets/:id", ticketController.deleteticket);

router.delete("/api/tickets", ticketController.delalltic);

router.post("/api/send-announcement", ticketController.sendannoucement);

router.post(
  "/submit-ticket",
  upload.single("image"),
  ticketController.submitticket
);

router.get("/api/records", ticketController.apirecord);

router.post("/track-ticket", ticketController.trackticket);

router.put("/api/tickets/:ticket_id/resolve", ticketController.resolveticket);

router.put("/api/tickets/:ticket_id/close", ticketController.closeticket);

router.get(
  "/api/searchbybranchcode/:branchcode",
  ticketController.searchbybranchcode
);

module.exports = router;
