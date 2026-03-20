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
    *   **Root Directory**: (Leave blank).
    *   **Runtime**: `Node`.
    *   **Build Command**: `npm run build`
    *   **Start Command**: `npm start`
4.  **Add Environment Variables (CRITICAL)**:
    *   Go to the **Environment** tab on Render.
    *   Click **Add Environment Variable** for each of these:
        *   `MONGO_URI`: (PASTE YOUR MONGODB ATLAS STRING HERE). **Do not use localhost!**
        *   `JWT_SECRET`: `restaurant_super_secret_key_2024` (or any random string).
        *   `JWT_EXPIRE`: `7d`.
        *   `BASE_URL`: `https://igansbudbodhouse.onrender.com`
        *   `PORT`: `10000`
5.  **Deploy**: Click **Create Web Service**. Render will now build and start your application.

---

### **⚠️ Fixing the 502 Bad Gateway / MongoDB Error**
Kung nakikita mo ang error na `connect ECONNREFUSED 127.0.0.1:27017` sa logs, ibig sabihin ay hindi mo pa nailalagay ang **MongoDB Atlas URI** sa Render Dashboard.

1. Pumunta sa [MongoDB Atlas](https://cloud.mongodb.com/).
2. I-copy ang connection string (yung may `mongodb+srv://...`).
3. Pumunta sa **Render Dashboard > Your Service > Environment**.
4. I-edit ang `MONGO_URI` at i-paste ang string mula sa Atlas.
5. I-save ang changes. Mag-re-restart ang server at dapat ay `✅ MongoDB Connected` na ang lumabas.


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
