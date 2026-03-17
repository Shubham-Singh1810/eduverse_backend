const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const Course = require("../model/course.Schema");
const Topic = require("../model/courseTopic.Schema");
const User = require("../model/user.Schema");
const courseController = express.Router();
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");

courseController.post(
  "/create",
  upload.fields([{ name: "image", maxCount: 1 }]),
  async (req, res) => {
    try {
      let imageUrl = "";
      if (req.files?.image?.length) {
        const uploadedImage = await cloudinary.uploader.upload(
          req.files.image[0].path,
        );
        imageUrl = uploadedImage.secure_url;
      }
      const obj = {
        ...req.body,
        image: imageUrl,
      };
      const courseCreated = await Course.create(obj);
      sendResponse(res, 200, "Success", {
        message: "Course created successfully!",
        data: courseCreated,
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

courseController.post("/list", async (req, res) => {
  try {
    const {
      searchKey = "",
      status,
      duration,
      pageNo = 1,
      pageCount = 10,
      sortByField,
      sortByOrder,
    } = req.body;
    const query = {};
    if (status) query.status = status;
    if (duration) query.duration = duration;
    if (searchKey) query.name = { $regex: searchKey, $options: "i" };
    const sortField = sortByField || "createdAt";
    const sortOrder = sortByOrder === "asc" ? 1 : -1;
    const sortOption = { [sortField]: sortOrder };
    const courseList = await Course.find(query).populate("categoryId")
      .populate("subCategoryId")
      .populate("instructorId")
      .sort(sortOption)
      .limit(parseInt(pageCount))
      .skip(parseInt(pageNo - 1) * parseInt(pageCount));
    const totalCount = await Course.countDocuments({});
    const activeCount = await Course.countDocuments({ status: "ongoing" });
    const upcomingCount = await Course.countDocuments({ status: "upcoming" });
    sendResponse(res, 200, "Success", {
      message: "Course list retrieved successfully!",
      data: courseList,
      documentCount: {
        totalCount,
        activeCount,
        upcomingCount,
        completedCount: totalCount - (activeCount + upcomingCount),
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

courseController.put(
  "/update",
  upload.fields([{ name: "image", maxCount: 1 }]),
  async (req, res) => {
    try {
      const id = req.body._id;
      const course = await Course.findById(id);

      if (!course) {
        return sendResponse(res, 404, "Failed", {
          message: "Course not found",
          statusCode: 403,
        });
      }

      let updatedData = { ...req.body };

      // Handle 'image'
      if (req.files?.image?.length) {
        if (course.image) {
          const publicId = batch.image.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        }
        const uploadedImage = await cloudinary.uploader.upload(
          req.files.image[0].path,
        );
        updatedData.image = uploadedImage.secure_url;
      }
      const updatedCourse = await Course.findByIdAndUpdate(id, updatedData, {
        new: true,
      });

      sendResponse(res, 200, "Success", {
        message: "Course updated successfully!",
        data: updatedCourse,
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

courseController.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return sendResponse(res, 404, "Failed", {
        message: "Course not found",
      });
    }
    const imageUrl = batch.image;
    if (imageUrl) {
      const publicId = imageUrl.split("/").pop().split(".")[0]; 
      await cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error("Error deleting image from Cloudinary:", error);
        } else {
          console.log("Cloudinary image deletion result:", result);
        }
      });
    }
    await Course.findByIdAndDelete(id);
    sendResponse(res, 200, "Success", {
      message: "Course and associated image deleted successfully!",
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

courseController.get("/details/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const CourseDetails = await Course.findOne({ _id: id })
      .populate("categoryId")
      .populate("subCategoryId")
      .populate("instructorId");

    if (!CourseDetails) {
      return sendResponse(res, 404, "Failed", {
        message: "Course not found",
        statusCode: 404,
      });
    }
    const sortField =  "srNo";
    const sortOrder = 1;
    const sortOption = { [sortField]: sortOrder };
    const topics = await Topic.find({courseId:id}).sort(sortOption)

    sendResponse(res, 200, "Success", {
      message: "Course details retrieved successfully!",
      data: {
        ...CourseDetails._doc, 
        topics: topics         
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

// courseController.get("/student-list/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const batchStudents = await User.find({ 
//       "myBatch.batchId": id 
//     }).select("firstName lastName phone profilePic profileStatus");
//     if (!batchStudents || batchStudents.length === 0) {
//       return sendResponse(res, 404, "Not Found", {
//         message: "No students found in this batch.",
//         data: [],
//         statusCode: 404,
//       });
//     }

//     sendResponse(res, 200, "Success", {
//       message: "Batch students retrieved successfully!",
//       totalStudents: batchStudents.length,
//       data: batchStudents,
//       statusCode: 200,
//     });
//   } catch (error) {
//     console.error("Error fetching students:", error);
//     sendResponse(res, 500, "Failed", {
//       message: error.message || "Internal server error",
//       statusCode: 500,
//     });
//   }
// });

module.exports = courseController;
