import { ApiError } from "../utils/commanUsed/ApiError.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/commanUsed/asyncHandler.js";
import { ApiResponse } from "../utils/commanUsed/ApiResponse.js";
import jwt from "jsonwebtoken";
import { google } from "googleapis";
import config from "../../config/google/config.js";

const OAuth2 = google.auth.OAuth2;

const oAuth2Client = new OAuth2(
  config.oauth2Credentials.client_id,
  config.oauth2Credentials.client_secret,
  config.oauth2Credentials.redirect_uris[0]
);

const googleAuth = asyncHandler(async (req, res) => {
  console.log("google creddentials:", process.env.CLIENT_ID);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      
    ],
  });
  res.redirect(authUrl);
});

const googleCallback = asyncHandler(async (req, res) => {
  if (req.query.error) {
    // The user did not give us permission.
    console.log("error did not give oermission", req.query.error);
    return res.redirect("/");
  } else {
    console.log("permission allowed", req.query);
    oAuth2Client.getToken(req.query.code, function (err, token) {
      if (err) return res.redirect("/");

      // Store the credentials given by google into a jsonwebtoken in a cookie called 'jwt'
      res.cookie("jwt", jwt.sign(token, config.JWTsecret));
      return res.redirect("/api/v1/user/auth/get_some_data");
    });
  }
});

const getSomeData = asyncHandler(async (req, res) => {
  if (!req.cookies.jwt) {
    // We haven't logged in
    return res.redirect("/");
  }
  // Create an OAuth2 client object from the credentials in our config file
  const oauth2Client = new OAuth2(
    config.oauth2Credentials.client_id,
    config.oauth2Credentials.client_secret,
    config.oauth2Credentials.redirect_uris[0]
  );
  // Add this specific user's credentials to our OAuth2 client
  oauth2Client.credentials = jwt.verify(req.cookies.jwt, config.JWTsecret);
  // Get the youtube service
  const service = google.oauth2({
    auth: oauth2Client,
    version: "v2",
  });

  const data = await service.userinfo.get();
  console.log("userdata", data);

  const user = await User.findOne({ email: data.data.email });
  if(!user){
    const newUser = await User.create({
      email: data.data.email,
      name: data.data.name,
      profilePic: data.data.picture,
    }) 
    console.log("new user created", newUser);
    req.user = newUser;
    return res.status(200).json(new ApiResponse(201 , newUser , "user created"));
  }
  
  console.log("user found", user);
  req.user = user;
  return res.status(200).json(new ApiResponse(200 , user , "user found"));

  

});

const googleLogOut = asyncHandler(async (req, res) => {
  res.clearCookie("jwt");
  return res.redirect("/api/v1/user");
})



export { googleAuth, googleCallback, getSomeData ,googleLogOut};
