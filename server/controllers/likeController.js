const Like = require("../models/likeSchema");
const Post = require("../models/postSchema");

exports.likePost = async (req, res) => {
  try {
    const { post, user } = req.body;

    // Check if the user has already liked the post
    const existingLike = await Like.findOne({ post, user });
    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: "You have already liked this post",
      });
    }

    // Create a new like
    const like = new Like({ post, user });
    const savedLike = await like.save();

    // Update the post with the new like
    const updatedPost = await Post.findByIdAndUpdate(
      post,
      { $push: { likes: savedLike._id } },
      { new: true }
    );

    res.status(200).json({
      post: updatedPost,
      success: true,
      message: "Successfully liked post",
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Error while liking post",
      error: error.message,
    });
  }
};

exports.unlikePost = async (req, res) => {
  try {
    const { post, user } = req.body;

    // Find and delete the like
    const deletedLike = await Like.findOneAndDelete({ post, user });

    if (!deletedLike) {
      return res.status(404).json({
        success: false,
        message: "Like not found or already deleted",
      });
    }

    // Update the post by removing the deleted like
    const updatedPost = await Post.findByIdAndUpdate(
      post,
      { $pull: { likes: deletedLike._id } }, // Remove the like ID from likes array
      { new: true }
    ).populate("likes");

    res.status(200).json({
      post: updatedPost,
      success: true,
      message: "Successfully unliked post",
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Error while unliking post",
      error: error.message,
    });
  }
};

exports.checkLike = async (req, res) => {
  try {
    const { postId, userId } = req.params;

    // Check if the user has liked the post
    const postLiked = await Post.exists({ _id: postId, likes: userId });

    res.status(200).json({ success: true, liked: true });
  } catch (error) {
    console.error("Error checking like status:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
