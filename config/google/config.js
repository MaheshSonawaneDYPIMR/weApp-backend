const config = {
  JWTsecret: `${process.env.ACCESS_TOKEN_SECRET}`,
  port: `${process.env.PORT}`,
  baseURL: `http://localhost:${process.env.PORT}`,

  oauth2Credentials: {
    client_id:
      "42186028592-t73j1iis6loaonm23dov8gisikarn4et.apps.googleusercontent.com",
    project_id: "weapp-419313",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_secret: "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",
    redirect_uris: ["http://localhost:8000/api/v1/user/auth/call_back"],
  },
//   oauth2Credentials: {
//     client_id:process.env.CLIENT_ID,
      
//     project_id: process.env.PROJECT_ID,
//     auth_uri: process.env.AUTH_URI,
//     token_uri: process.env.TOKEN_URI,
//     auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
//     client_secret: process.env.CLIENT_SECRET,
//     redirect_uris:process.env.REDIRECT_URIS,
//   },
};

export default config;
