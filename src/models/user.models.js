import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const diseasesEnum = [
  "Type 1 Diabetes",
  "Rheumatoid Arthritis (RA)",
  "Chronic Kidney Disease (CKD)",
  "Crohn's Disease and Ulcerative Colitis",
  "Severe Asthma",
  "Thalassemia",
  "Cystic Fibrosis (CF)",
  "Hereditary Angioedema (HAE)",
  "Hemophilia",
  "HIV/AIDS",
];

const lifestyleEnum = [
  "Urban Lifestyle",
  "Rural Lifestyle",
  "Tribal Lifestyle",
  "Professional Lifestyle",
  "Spiritual and Religious Lifestyle",
];

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
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
      required: true,
      enum: ["Male", "Female"],
    },

    height: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    disease: {
      type: String,
      enum: diseasesEnum,
    },
    age: {
      type: Number,
    },
    bloodGroup: {
      type: String,

      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
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
    },
    isSmoker: {
      type: Boolean,
    },
    isDrinker: {
      type: Boolean,
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
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      phone: this.phone,
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
