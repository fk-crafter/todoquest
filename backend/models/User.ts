import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema: Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // nom obligatoire
    },
    email: {
      type: String,
      required: true,
      unique: true, // vérifie si l'email est unique
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"], // vérifie si l'utilisateur est admin ou user
      default: "user", // par défaut, c'est un utilisateur normal
    },
  },
  {
    timestamps: true, // ajoute automatiquement les champs "createdAt" et "updatedAt"
  }
);

// Middleware avant de sauvegarder un utilisateur : hachage du mot de passe
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);
export default User;
