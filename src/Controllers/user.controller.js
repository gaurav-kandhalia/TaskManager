import { asyncHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js"
 import jwt from 'jsonwebtoken'

// generate jwt token
const generateAccessandRefreshTokens = async(userId)=>{
     const user = await User.findById(userId);
   const accessToken =user.generateAccessToken();
   const refreshToken = user.generateRefreshToken();

   console.log("accessToken",accessToken);
   console.log("refreshToken",refreshToken);

     user.refreshToken  = refreshToken;
     await user.save({validateBeforeSave:false});

     return {refreshToken,accessToken}
}

// register User
const registerUser = asyncHandler(async (req, res) => {
 

  const {fullname, email, password } = req.body
  console.log(req.body)


  if (
      [fullname, email, password].some((field) => field?.trim() === "")
  ) {
      throw new ApiError(400, "All fields are required")
  }

  const existedUser = await User.findOne({
      $or: [{ email }]
  })

  if (existedUser) {
      throw new ApiError(409, "User with email or username already exists")
  }
 
 

  const user = new User({
      fullname,
      email, 
      password,
     
  })

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  user.accessToken = accessToken;

  await user.save();

  const createdUser = await User.findById(user._id).select(
      "-password "
  )


  if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user")
  }

  const options ={
    secure:true,
    httpOnly: true,
    sameSite:"None"
}

  return res.status(201)
  
  .json(
      new ApiResponse(200, {createdUser,accessToken}, "User registered Successfully")
  )

} )
// login user
const loginUser =  asyncHandler( async (req,res)=>{
 
    const {email,password} = req.body;

if(!email){
    throw new ApiError(400,"email or username is required")
}

const user = await User.findOne({
    $or:[{email}]
});



if(!user){
    throw new ApiError(401,"Invalid user Credentials");
}

if(!password){
    throw new ApiError(401,"Password is required")
}

const isPasswordValid =await user.isPasswordCorrect(password);

if(!isPasswordValid){
    throw new ApiError(401,"Invalid user credentials");
}


const {accessToken,refreshToken} = await generateAccessandRefreshTokens(user._id);



const loggedInUser = await User.findById(user._id).select("-password -refreshToken")






res.
status(200)

.json(new ApiResponse(200,
    {
        user:loggedInUser,
        accessToken,
        refreshToken

},
"user logged in successfully"
)
)



})


const logoutUser = asyncHandler(async(req, res) => {

    await User.findByIdAndUpdate(req.user._id, {
        $unset: { refreshToken: 1 }
    });



    return res
        .status(200)  
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});





export { registerUser , loginUser,logoutUser}