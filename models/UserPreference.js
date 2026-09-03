import mongoose from "mongoose";

const UserPreferenceSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  image: { type: String },
  genre: { type: [String], default: ["Action", "Sci-Fi", "Thriller", "Horror", "Drama", "Comedy"] },
  language: { type: [String], default: ["English", "Hindi", "Spanish", "Korean", "Japanese"] },
  industry: { type: [String], default: ["Hollywood", "Bollywood", "Korean Cinema", "Anime", "European"] },
  releasePeriod: { type: [String], default: ["Classic (Pre-2000)", "Modern (2000-2019)", "Current (2020+)"] },
  lastUpdated: { type: Date, default: Date.now }
});

// Purge the old cached model if it exists so Next.js doesn't use outdated schemas
if (mongoose.models.UserPreference) {
  delete mongoose.models.UserPreference;
}

export default mongoose.model("UserPreference", UserPreferenceSchema);