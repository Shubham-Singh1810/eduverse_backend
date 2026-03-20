const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const Type = require("../model/type.Schema");
const typeController = express.Router();
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const Category = require("../model/category.Schema");
const { sendNotification } = require("../utils/sendNotification");
const { stack } = require("./userController");

typeController.post(
  "/create",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      let imageUrl = "";
      let coverImageUrl = "";
      if (req.files?.image?.length) {
        const uploadedImage = await cloudinary.uploader.upload(
          req.files.image[0].path,
        );
        imageUrl = uploadedImage.secure_url;
      }
      if (req.files?.coverImage?.length) {
        const uploadedCoverImage = await cloudinary.uploader.upload(
          req.files.coverImage[0].path,
        );
        coverImageUrl = uploadedCoverImage.secure_url;
      }
      const obj = {
        ...req.body,
        image: imageUrl,
        coverImage: coverImageUrl,
      };
      const CategoryCreated = await Type.create(obj);
      sendResponse(res, 200, "Success", {
        message: "Type created successfully!",
        data: CategoryCreated,
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

typeController.post("/list", async (req, res) => {
  try {
    const {
      searchKey = "",
      status,
      pageNo = 1,
      pageCount = 10,
      sortByField,
      sortByOrder,
    } = req.body;
    const query = {};
    if (status) query.status = status;
    if (searchKey) query.name = { $regex: searchKey, $options: "i" };
    const sortField = sortByField || "createdAt";
    const sortOrder = sortByOrder === "asc" ? 1 : -1;
    const sortOption = { [sortField]: sortOrder };
    const categoryList = await Type.find(query)
      .sort(sortOption)
      .limit(parseInt(pageCount))
      .skip(parseInt(pageNo - 1) * parseInt(pageCount));
    const totalCount = await Type.countDocuments({});
    const activeCount = await Type.countDocuments({ status: true });
    sendResponse(res, 200, "Success", {
      message: "Category list retrieved successfully!",
      data: categoryList,
      documentCount: {
        totalCount,
        activeCount,
        inactiveCount: totalCount - activeCount,
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

typeController.put(
  "/update",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const id = req.body._id;
      const category = await Type.findById(id);

      if (!category) {
        return sendResponse(res, 404, "Failed", {
          message: "Category not found",
          statusCode: 403,
        });
      }

      let updatedData = { ...req.body };

      // Handle 'image'
      if (req.files?.image?.length) {
        if (category.image) {
          const publicId = category.image.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        }
        const uploadedImage = await cloudinary.uploader.upload(
          req.files.image[0].path,
        );
        updatedData.image = uploadedImage.secure_url;
      }

      // Handle 'coverImage'
      if (req.files?.coverImage?.length) {
        if (category.coverImage) {
          const publicId = category.coverImage.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        }
        const uploadedCoverImage = await cloudinary.uploader.upload(
          req.files.coverImage[0].path,
        );
        updatedData.coverImage = uploadedCoverImage.secure_url;
      }

      const updatedCategory = await Type.findByIdAndUpdate(
        id,
        updatedData,
        {
          new: true,
        },
      );

      sendResponse(res, 200, "Success", {
        message: "Category updated successfully!",
        data: updatedCategory,
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

typeController.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Type.findById(id);
    if (!category) {
      return sendResponse(res, 404, "Failed", {
        message: "Category not found",
      });
    }
    const imageUrl = category.image;
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
    await Type.findByIdAndDelete(id);
    sendResponse(res, 200, "Success", {
      message: "Category and associated image deleted successfully!",
      statusCode:200
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

typeController.get("/details/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const typeDetails = await Type.findOne({ _id: id });
    const categoryDetails = await Category.find({ categoryId: id });
    sendResponse(res, 200, "Success", {
      message: "Type with category retrived successfully!",
      data: { typeDetails, categoryDetails },
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

module.exports = typeController;
