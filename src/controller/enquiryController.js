const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const Enquiry = require("../model/enquiry.Schema");
const enquiryController = express.Router();
require("dotenv").config();


enquiryController.post("/create", async (req, res) => {
  try {
    const enquiryCreated = await Enquiry.create(req.body);
    sendResponse(res, 200, "Success", {
      message: "Enquiry created successfully!",
      data: enquiryCreated,
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

enquiryController.post("/list", async (req, res) => {
  try {
    const {
      searchKey = "",
      pageNo = 1,
      pageCount = 10,
      sortByField,
      sortByOrder,
      isResponded,
    } = req.body;
    const query = {};
    if (isResponded) query.isResponded = isResponded;
    if (searchKey) {
      query.$or = [
        { fullName: { $regex: searchKey, $options: "i" } },
        { email: { $regex: searchKey, $options: "i" } },
        { message: { $regex: searchKey, $options: "i" } },
      ];

      if (!isNaN(searchKey)) {
        query.$or.push({ contactNumber: Number(searchKey) });
      }
    }

    const sortField = sortByField || "createdAt";
    const sortOrder = sortByOrder === "asc" ? 1 : -1;
    const sortOption = { [sortField]: sortOrder };
    const enquiryList = await Enquiry.find(query)
      .sort(sortOption)
      .limit(parseInt(pageCount))
      .skip(parseInt(pageNo - 1) * parseInt(pageCount));
    const totalCount = await Enquiry.countDocuments({});
    const activeCount = await Enquiry.countDocuments({ isResponded: true });
    const inactiveCount = await Enquiry.countDocuments({ isResponded: false });

    sendResponse(res, 200, "Success", {
      message: "Enquiry list retrived successfully.",
      data: enquiryList,
      documentCount: { totalCount, activeCount, inactiveCount },
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500,
    });
  }
});

enquiryController.put("/update", async (req, res) => {
  try {
    const id = req.body._id;

    // Find the category by ID
    const enquiryData = await Enquiry.findById(id);
    if (!enquiryData) {
      return sendResponse(res, 404, "Failed", {
        message: "Enquiry not found",
      });
    }

    let updatedData = { ...req.body };
    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      id,
      updatedData,
      {
        new: true, 
      }
    );
    sendResponse(res, 200, "Success", {
      message: "Enquiry updated successfully!",
      data: updatedEnquiry,
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

enquiryController.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const enquiryItem = await Enquiry.findById(id);
    if (!enquiryItem) {
      return sendResponse(res, 404, "Failed", {
        message: "Enquiry not found",
      });
    }
   
    await Enquiry.findByIdAndDelete(id);

    sendResponse(res, 200, "Success", {
      message: "Enquiry deleted successfully!",
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

module.exports = enquiryController;
