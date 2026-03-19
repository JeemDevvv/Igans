# Deployment Guide: Igan's Budbod House System

This guide provides step-by-step instructions to deploy the ordering system using **MongoDB Atlas** and **Render**.

---

## Part 1: Setup MongoDB Atlas (Database)

1.  **Create an Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up.
2.  **Create a Cluster**: Choose the **FREE** (Shared) Tier. Select a region close to your users (e.g., AWS / Singapore).
3.  **Database Access**:
    *   Go to **Security > Database Access**.
    *   Click **Add New Database User**.
    *   Set a username and a **strong password**.
    *   Set the "Built-in Role" to **Read and write to any database**.
4.  **Network Access**:
    *   Go to **Security > Network Access**.
    *   Click **Add IP Address**.
    *   Select **Allow Access from Anywhere** (`0.0.0.0/0`). This is necessary because Render's IP addresses change.
5.  **Get Connection String**:
    *   Go to **Deployment > Database**.
    *   Click **Connect** on your cluster.
    *   Select **Drivers** (Node.js).
    *   Copy the **Connection String** (e.g., `mongodb+srv://<username>:<password>@cluster0.abc.mongodb.net/?retryWrites=true&w=majority`).
    *   **IMPORTANT**: Replace `<password>` with the password you created in Step 3.

---

## Part 2: Deploy to Render (Server & Frontend)

1.  **Push Code to GitHub**: (Already done in previous steps).
2.  **Create a Web Service on Render**:
    *   Log in to [Render](https://render.com/).
    *   Click **New +** and select **Web Service**.
    *   Connect your GitHub repository (`JeemDevvv/Igans`).
3.  **Configure Settings**:
    *   **Name**: `igans-restaurant-system` (or your choice).
    *   **Region**: Same as your MongoDB cluster (e.g., Singapore).
    *   **Branch**: `main`.
    *   **Root Directory**: (Leave blank). The root `package.json` I added will handle delegation.
    *   **Runtime**: `Node`.
    *   **Build Command**: `npm run build` (This installs backend dependencies).
    *   **Start Command**: `npm start` (This starts the backend server).
4.  **Add Environment Variables**:
    *   Go to the **Environment** tab on Render.
    *   Add the following variables:
        *   `MONGO_URI`: Your connection string from MongoDB Atlas.
        *   `JWT_SECRET`: A long random string (e.g., `your_secret_key_123`).
        *   `JWT_EXPIRE`: `7d`.
        *   `OPENAI_API_KEY`: Your OpenAI API key for the AI features.
        *   `BASE_URL`: The URL Render provides for your service (e.g., `https://igans.onrender.com`).
        *   `PORT`: `10000` (Render's default).
5.  **Deploy**: Click **Create Web Service**. Render will now build and start your application.

---

## Part 3: Populate the Database (Seeding)

Once the service is live, you can populate the initial menu categories and items:

1.  On the Render dashboard, go to the **Shell** tab of your service.
2.  Run the following command:
    ```bash
    cd backend && node utils/seeder.js
    ```
    *This will add the default menu items and admin user.*

---

## Part 4: Accessing the App

*   **Admin Panel**: `https://your-app.onrender.com/admin/dashboard.html`
*   **Customer Menu**: `https://your-app.onrender.com/menu.html`
*   **Default Admin Login**:
    *   Email: `admin@example.com` (Check `backend/utils/seeder.js` for default credentials).
    *   Password: `admin123`

---

### **Troubleshooting**
*   **Logs**: Check the **Logs** tab on Render if the build or deploy fails.
*   **Root Directory**: If Render doesn't find the `package.json`, ensure the **Root Directory** setting is empty and it will use the delegator `package.json` I created in the root.
