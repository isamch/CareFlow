
// 1. Controller Methods (RESTful)

// فـ REST API، كنلتازمو بنفس الأسماء باش يكون الكود منظم وسهل الفهم:
// index(req, res) → عرض جميع العناصر (GET /api/items)
// store(req, res) → إضافة عنصر جديد (POST /api/items)
// show(req, res) → عرض عنصر واحد بالـ ID (GET /api/items/:id)
// update(req, res) → تحديث عنصر (PUT/PATCH /api/items/:id)
// destroy(req, res) → حذف عنصر (DELETE /api/items/:id)


// 2. These are methods provided by Mongoose to interact with the database:

// Model.find() → get all documents
// Model.findById(id) → get one by ID
// Model.findOne(query) → get one by condition
// Model.create(data) → insert a document
// Model.insertMany(docs) → insert multiple
// Model.updateOne(query, update) → update one
// Model.updateMany(query, update) → update many
// Model.findByIdAndUpdate(id, update, options)
// Model.deleteOne(query)
// Model.deleteMany(query)
// Model.findByIdAndDelete(id)

import User from "./../models/User.js";
import { successResponse, apiResponse } from './../utils/apiResponse.js'
import { getPagination } from './../utils/pagination.js';
import { doHash } from './../utils/hashing.js';



export const index = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 1);
  const total = await User.countDocuments();

  if (!total) {
    throw { statusCode: 404, message: "No users found" };
  }

  const users = await User.find().skip(skip).limit(limit).sort({ createdAt: -1 });

  const result = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    results: users
  }
  return successResponse(res, 200, result, "succsess getting all users");
};


export const show = async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id);
  return successResponse(res, 200, user, "succsess getting the user");
};


export const store = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw { statusCode: 400, message: "email already exist" };
  }

  const hashedPassword = await doHash(password);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.verificationCode;
  delete userObj.verificationCodeValidationTime;

  return successResponse(res, 201, userObj, "created successfuly");
};



export const update = async (req, res) => {

  const id = req.params.id;

  const user = await User.findById(id);
  if (!user) throw { statusCode: 404, message: "User not found" };



  const { name, email, password, verified } = req.body;

  if (name) user.name = name;

  if (email && email.toLowerCase() !== user.email) {

    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) throw { statusCode: 400, message: "Email already in use" };

    user.email = email.toLowerCase();
    user.verified = false;
  }

  if (typeof verified !== "undefined") {
    if (typeof verified !== "boolean") {
      throw { statusCode: 400, message: "Verified must be a boolean" };
    }
    user.verified = verified;
  }

  if (password) {
    user.password = await doHash(password);
  }

  await user.save();

  user.password = undefined;


  return successResponse(res, 200, user, "update successfuly");

};




export const destroy = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    throw { statusCode: 404, message: "User not found" };
  }

  await user.deleteOne();

  return successResponse(res, 200, null, "User deleted successfully");
};
