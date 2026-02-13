const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const Booking = require("../model/booking.Schema");
const Coupon = require("../model/coupon.Schema");
const bookingController = express.Router();
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");

bookingController.post(
  "/create",
  upload.fields([{ name: "image", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { couponId } = req.body;
      let imageUrl = "";
      if (couponId) {
        const coupon = await Coupon.findById(couponId);
        
        if (!coupon) {
          return sendResponse(res, 400, "Failed", { message: "Invalid Coupon" });
        }
        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
          return sendResponse(res, 400, "Failed", { message: "Coupon limit reached!" });
        }
        if (coupon.status !== "active") {
          return sendResponse(res, 400, "Failed", { message: "Coupon is no longer active" });
        }
      }
      if (req.files?.image?.length) {
        const uploadedImage = await cloudinary.uploader.upload(
          req.files.image[0].path
        );
        imageUrl = uploadedImage.secure_url;
      }

      const obj = {
        ...req.body,
        image: imageUrl,
      };
      const bookingCreated = await Booking.create(obj);
      if (couponId) {
        await Coupon.findByIdAndUpdate(couponId, {
          $inc: { usedCount: 1 }
        });
      }

      sendResponse(res, 200, "Success", {
        message: "Booking created successfully!",
        data: bookingCreated,
        statusCode: 200,
      });

    } catch (error) {
      console.error(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
        statusCode: 500,
      });
    }
  }
);

bookingController.post("/list", async (req, res) => {
  try {
    const {
      pageNo = 1,
      pageCount = 10,
      userId,  
      batchId,  
      couponId, 
      sortOption = { createdAt: -1 } 
    } = req.body;
    let query = {};

    if (userId) query.userId = userId;
    if (batchId) query.batchId = batchId;
    if (couponId) query.couponId = couponId;
    const totalCount = await Booking.countDocuments(query);

    const bookingList = await Booking.find(query)
      .populate("userId")
      .populate("batchId")
      .populate("couponId")
      .sort(sortOption)
      .limit(parseInt(pageCount))
      .skip(parseInt(pageNo - 1) * parseInt(pageCount));
    
    sendResponse(res, 200, "Success", {
      message: "Booking list retrieved successfully!",
      data: bookingList,
      documentCount: {
        totalCount: totalCount 
      },
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

bookingController.put(
  "/update",
  upload.fields([{ name: "image", maxCount: 1 }]),
  async (req, res) => {
    try {
      const id = req.body._id;
      const batch = await Batch.findById(id);

      if (!batch) {
        return sendResponse(res, 404, "Failed", {
          message: "Batch not found",
          statusCode: 403,
        });
      }

      let updatedData = { ...req.body };

      // Handle 'image'
      if (req.files?.image?.length) {
        if (batch.image) {
          const publicId = batch.image.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        }
        const uploadedImage = await cloudinary.uploader.upload(
          req.files.image[0].path,
        );
        updatedData.image = uploadedImage.secure_url;
      }
      const updatedBatch = await Batch.findByIdAndUpdate(id, updatedData, {
        new: true,
      });

      sendResponse(res, 200, "Success", {
        message: "Batch updated successfully!",
        data: updatedBatch,
        statusCode: 200,
      });
    } catch (error) {
      console.error(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
        statusCode: 500,
      });
    }
  },
);

bookingController.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await Batch.findById(id);
    if (!batch) {
      return sendResponse(res, 404, "Failed", {
        message: "Batch not found",
      });
    }
    const imageUrl = batch.image;
    if (imageUrl) {
      const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract public ID
      // Delete the image from Cloudinary
      await cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error("Error deleting image from Cloudinary:", error);
        } else {
          console.log("Cloudinary image deletion result:", result);
        }
      });
    }
    await Batch.findByIdAndDelete(id);
    sendResponse(res, 200, "Success", {
      message: "Batch and associated image deleted successfully!",
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

bookingController.get("/details/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const BatchDetails = await Batch.findOne({ _id: id })
      .populate("categoryId")
      .populate("subCategoryId")
      .populate("instructorId");

    if (!BatchDetails) {
      return sendResponse(res, 404, "Failed", {
        message: "Batch not found",
        statusCode: 404,
      });
    }

    sendResponse(res, 200, "Success", {
      message: "Batch details retrieved successfully!",
      data: BatchDetails,
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

module.exports = bookingController;
