const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const BulkBooking = require("../model/bulkBooking.Schema");
const User = require("../model/user.Schema");
const bulkBookingController = express.Router();
require("dotenv").config();


bulkBookingController.post("/create", async (req, res) => {
  try {
    const { UserIds, batchId } = req.body;
    const bookingCreated = await BulkBooking.create(req.body);
    if (UserIds && UserIds.length > 0 && batchId) {
      await User.updateMany(
        { _id: { $in: UserIds } },
        { 
          $addToSet: { 
            myBatch: { loanApplicationId: batchId } 
          } 
        }
      );
    }

    sendResponse(res, 200, "Success", {
      message: "Bulk Booking created and batch assigned to all users!",
      data: bookingCreated,
      statusCode: 200,
    });

  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

bulkBookingController.post("/list", async (req, res) => {
  try {
    const {
      searchKey = "",
      pageNo = 1,
      pageCount = 10,
      sortOption = { createdAt: -1 } 
    } = req.body;

    const query = {};
    if (searchKey) query.organisation = { $regex: searchKey, $options: "i" };

    const bulkBookingList = await BulkBooking.find(query)
      .sort(sortOption)
      .limit(parseInt(pageCount))
      .skip((parseInt(pageNo) - 1) * parseInt(pageCount))
      .populate({
        path: "UserIds", 
        select: "firstName lastName email phone"
      })
      .populate({
        path: "createdBy",
        select: "firstName lastName email" 
      })
      .populate({
        path: "batchId",
      });
    const totalCount = await BulkBooking.countDocuments(query);
    sendResponse(res, 200, "Success", {
      message: "Bulk Booking list retrieved successfully!",
      data: bulkBookingList,
      documentCount: {
        totalCount,
      },
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

bulkBookingController.put("/update", async (req, res) => {
  try {
    const id = req.body._id;

    // Find the category by ID
    const bookingData = await BulkBooking.findById(id);
    if (!bookingData) {
      return sendResponse(res, 404, "Failed", {
        message: "Booking not found",
      });
    }

    let updatedData = { ...req.body };
    // Update the category in the database
    const updatedBooking = await BulkBooking.findByIdAndUpdate(
      id,
      updatedData,
      {
        new: true, // Return the updated document
      }
    );
    sendResponse(res, 200, "Success", {
      message: "Booking updated successfully!",
      data: updatedBooking,
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

bulkBookingController.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const bookingData = await BulkBooking.findById(id);
    if (!bookingData) {
      return sendResponse(res, 404, "Failed", {
        message: "Booking not found",
      });
    }
    // Delete the address from the database
    await BulkBooking.findByIdAndDelete(id);

    sendResponse(res, 200, "Success", {
      message: "Booking deleted successfully!",
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

module.exports = bulkBookingController;
