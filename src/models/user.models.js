import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const diseasesEnum = [
  "Type 1 Diabetes",
  "Chronic Kidney Disease (CKD)",
  "Severe Asthma",
  "High BP",
  "HIV/AIDS",
];

const lifestyleEnum = [
  "Urban Lifestyle",
  "Rural Lifestyle",
  "Tribal Lifestyle",
  "Professional Lifestyle",
  "Spiritual and Religious Lifestyle",
];

const ageEnum = [14, 21, 32, 48, 55, 68];

const genderEnum = ["Male", "Female", "Non-Binary"];
const BMIEnum = [
  "under Weight",
  "Normal",
  "overWeight Risk",
  "overWeight",
  "obese",
];

const bloodGroupEnum = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const diseasesPeriodEnum = [6, 12, 24, 48,72]

const userSchema = new mongoose.Schema(
  {
    password: {
      type: String,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },

    username: {
      type: String,
      unique: true,
    },
    profilePic: {
      type: String,
    },
    address: {
      type: String,
    },
    bio: {
      type: String,
    },
    gender: {
      type: String,

      enum: genderEnum,
    },

    BMI: {
      type: String,
      enum: BMIEnum,
    },
    disease: {
      type: String,
      enum: diseasesEnum,
    },
    age: {
      type: Number,
      enum: ageEnum,
    },
    bloodGroup: {
      type: String,

      enum: bloodGroupEnum,
    },
    lifeStyle: {
      type: String,

      enum: lifestyleEnum,
    },
    familyHistory: {
      type: String,

      enum: ["Yes", "No"],
    },
    diseasePeriod: {
      type: Number,
      enum:diseasesPeriodEnum
    },
    isSmoker: {
      type:String,
      enum: ["Yes", "No"]
    },
    isDrinker: {
      type:String,
      enum: ["Yes", "No"]
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    console.log("Password not modified. Skipping hashing.");
    return next();
  }

  console.log("Hashing password...");
  this.password = await bcrypt.hash(this.password, 10);
  console.log("Password hashed successfully.");

  next();
});

userSchema.methods.isPasswordcorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: `${process.env.ACCESS_TOKEN_EXPIRY}`,
    }
  );
};

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: `${process.env.REFRESH_TOKEN_EXPIRY}`,
    }
  );
};

export const User = mongoose.model("User", userSchema);
