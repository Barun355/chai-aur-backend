import { asyncHandlerPromise } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../service/cloudinary.js"

const registerUser = asyncHandlerPromise(async (req, res) => {
    // get user details from frontend
    console.log(req.body)
    const { username, fullname, email, password } = req.body
    console.log(username, fullname, email, password);

    // validation - not empty
    if (
        [fullname, username, email, password].some(field => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are compulsory and required")
    }

    // check if user already exists: username, email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User or email already exists")
    }

    // check for images, check for avatar
    console.log(req)
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // upload them to cloudinary, check avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new ApiError(400, "Avatar not stored to the server successfully")
    }

    // create user object - create entry in db
    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        avatar: coverImage?.url || "",
    })

    // check for user creation
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // remove password and reresh token field from response
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user")
    }

    // return res
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

export { registerUser }