import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const options = {
  httpOnly: true,
  secure: true,
};

const generateAccessAndRefreshToken = async (userId) => {
  // find user in db
  // generate access and refresh Token
  // update refresh token in db
  // save the updated token
  // return access and refresh token

  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      error?.message ||
        "Something went wrong while generating access and refresh token."
    );
  }
};

const registerUser = AsyncHandler(async (req, res) => {
  // get user details from the request body (front-end)
  // validate input, if it is empty
  // check user if it already exists, email
  // check for images - avatar, coverImage
  // upload images to cloudinary, avatar
  // Create user object - user entry in Database
  // remove the password and refresh token from the response
  // check if the user is created
  // send response

  const { fullName, email, password } = req.body;

  if ([fullName, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required!");
  }

  const userExisted = await User.findOne({ email });
  if (userExisted) {
    throw new ApiError(
      409,
      "User with this email already exists, please try using another email Id."
    );
  }

  let avatarLocalPath;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files.avatar[0].path;
  }

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.avatar.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  const user = await User.create({
    fullName,
    email,
    avatar: avatar?.url || "",
    coverImage: coverImage?.url || "",
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user!");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created Successfully!"));
});

const loginUser = AsyncHandler(async (req, res) => {
  // get user details from req body
  // validate details
  // find user in db
  // validate password
  // generate access and refresh token
  // fetch logged in user
  // send cookie
  // send response

  const { email, password } = req.body;
  if (!(email || password)) {
    throw new ApiError(400, "Email and password is required!");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User with this email does not exist.");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Password!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully."
      )
    );
});

const logoutUser = AsyncHandler(async (req, res) => {
  // find user and remove refresh token
  // send response

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully."));
});

export { registerUser, loginUser, logoutUser };
