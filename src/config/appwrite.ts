import { Client, Storage } from "node-appwrite";
import dotenv from "dotenv";

dotenv.config();

const client = new Client();

// Force the endpoint and check for typos
const endpoint = "https://cloud.appwrite.io/v1"; 
const project = (process.env.APPWRITE_PROJECT_ID || "").trim();
const key = (process.env.APPWRITE_API_KEY || "").trim();

client
    .setEndpoint(endpoint)
    .setProject(project)
    .setKey(key);

export const appwriteStorage = new Storage(client);