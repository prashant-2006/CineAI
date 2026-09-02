import mongoose from "mongoose";

const UserMovieSchema = new mongoose.Schema({
  email: { type: String, required: true },
  imdbID: { type: String, required: true },
  type: { type: String, enum: ["watchlist", "favourite", "activity"], required: true },
  addedAt: { type: Date, default: Date.now }
});

UserMovieSchema.index({ email: 1, imdbID: 1, type: 1 }, { unique: true });

export default mongoose.models.UserMovie || mongoose.model("UserMovie", UserMovieSchema);