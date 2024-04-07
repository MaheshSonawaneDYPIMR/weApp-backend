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

const ageEnum = ["18-24", "25-34", "35-44", "45-54", "55-64", "65-74"];

const genderEnum = ["Male", "Female", "Non-Binary"];
const BMIEnum = [
  "0 - 18.5(under Weight)",
  "18.6 - 22.9(Normal)",
  "23 - 24.9(overWeight Risk)",
  "25 - 29.9(overWeight)",
  "30 - above(obese)",
];

const bloodGroupEnum = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const diseasesPeriodEnum = ["0 - 6 months", "6 months - 1 year", "1 - 2 years", "2 - 4 years","5 - above years"]

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
