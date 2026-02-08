import { Client, Storage } from "node-appwrite";
import dotenv from "dotenv";

dotenv.config();

const endpoint = process.env.APPWRITE_ENDPOINT?.trim() || "https://cloud.appwrite.io/v1";
const projectId = process.env.APPWRITE_PROJECT_ID?.trim();
const apiKey = process.env.APPWRITE_API_KEY?.trim();

if (!projectId || !apiKey) {
    console.error("❌ CRITICAL: Appwrite Project ID or API Key is missing in .env");
}

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId!)
    .setKey(apiKey!);

export const appwriteStorage = new Storage(client);