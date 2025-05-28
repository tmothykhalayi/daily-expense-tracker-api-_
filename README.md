## **Daily Expense Tracker System Overview**

The **Daily Expense Tracker System** is a web-based application built using **PHP** and **MySQL** to help users manage their daily, monthly, and yearly expenses. The system enables users to record their daily expenses, track expenditures, generate reports, and view insights about their spending habits. The application consists of two primary modules: **User** and  **Admin** .

---

### **Modules of the Daily Expense Tracker System**

1. **User Module**
2. **Admin Module**

---

### **User Module**

The **User Module** allows users to track their expenses and manage their personal profiles. The system provides detailed insights into spending patterns and generates reports on a daily, monthly, and yearly basis.

#### **Features:**

1. **Dashboard** :

* **Overview** : Users can view a summary of their daily, monthly, and yearly expenses.
* **Expense Overview** : A graph or chart showing expenses for the selected time period.

1. **Expenses** :

* **Add Expenses** : Users can add new expenses by providing details such as amount, category (e.g., food, transportation), date, and description.
* **Delete Expenses** : Users can delete expenses that they no longer want to track.

1. **Expense Report** :

* **Daily Report** : View expenses recorded for a particular day.
* **Monthly Report** : View expenses recorded in a particular month.
* **Yearly Report** : View all expenses over the course of a year.
* **Category-wise Report** : View expenses by category, helping users analyze where they are spending the most.

1. **Profile** :

* **Update Profile** : Users can update personal details such as name, email, contact information, etc.

1. **Change Password** :

* Users can change their password for security purposes.

1. **Logout** :

* Users can log out of the application.

1. **Password Recovery** :

* If users forget their password, they can recover it through email or security questions.

---

### **Admin Module**

The **Admin Module** allows administrators to manage users, categories, and generate reports. Admins have broader access to the system and can manage all users and their data.

#### **Features:**

1. **Dashboard** :

* **Overview** : Admin can see a summary of all users' daily, monthly, and yearly expenses.
* **Category Overview** : Admin can view the categories created for expenses and see which categories are being used the most.

1. **Categories** :

* **Manage Categories** : Admin can create new expense categories (e.g., Food, Travel, Entertainment), edit existing ones, or delete unused categories.

1. **Users** :

* **Manage Users** : Admin can view, edit, or delete users. Admin can also view the user's expenses and profile.
* **View User Expenses** : Admin can see the expenses for each user, along with the dates and categories.

1. **Reports** :

* **Generate User-wise Report** : Admin can generate detailed reports for individual users, showing their expenses for different time periods.
* **Date Range Reports** : Admin can generate reports between specific dates, allowing for custom date ranges to be selected.

1. **Profile** :

* **Update Profile** : Admin can update personal details such as name, email, contact details, etc.

1. **Change Password** :

* Admin can change their password for security purposes.

1. **Logout** :

* Admin can log out of the application.

1. **Password Recovery** :

* Admin can recover the password through a secure email or authentication method.

---

### **Database Schema Design**

Here is the database schema for the  **Daily Expense Tracker System (DETS)** :

#### **1. Users Table (`users`)**

| Column Name    | Data Type                         | Description                      |
| -------------- | --------------------------------- | -------------------------------- |
| `user_id`    | INT (Primary Key, Auto Increment) | Unique identifier for each user  |
| `username`   | VARCHAR(255)                      | Username for user login          |
| `email`      | VARCHAR(255)                      | User's email address             |
| `password`   | VARCHAR(255)                      | Encrypted password               |
| `role`       | ENUM('Admin', 'User')             | Role of the user (Admin or User) |
| `created_at` | TIMESTAMP                         | Account creation timestamp       |
| `updated_at` | TIMESTAMP                         | Last update timestamp            |

#### **2. Expenses Table (`expenses`)**

| Column Name     | Data Type                         | Description                                  |
| --------------- | --------------------------------- | -------------------------------------------- |
| `expense_id`  | INT (Primary Key, Auto Increment) | Unique identifier for each expense           |
| `user_id`     | INT (Foreign Key)                 | Reference to the `users`table              |
| `amount`      | DECIMAL(10, 2)                    | The expense amount                           |
| `category`    | VARCHAR(100)                      | Category of the expense (e.g., Food, Travel) |
| `date`        | DATE                              | Date of the expense                          |
| `description` | TEXT                              | Description of the expense                   |
| `created_at`  | TIMESTAMP                         | Timestamp when the expense was added         |
| `updated_at`  | TIMESTAMP                         | Timestamp when the expense was last updated  |

#### **3. Categories Table (`categories`)**

| Column Name       | Data Type                         | Description                               |
| ----------------- | --------------------------------- | ----------------------------------------- |
| `category_id`   | INT (Primary Key, Auto Increment) | Unique identifier for each category       |
| `category_name` | VARCHAR(100)                      | Name of the category (e.g., Food, Travel) |
| `created_at`    | TIMESTAMP                         | Timestamp when the category was created   |

#### **4. Reports Table (`reports`)** *(Optional, if needed for admin reporting)*

| Column Name      | Data Type                         | Description                             |
| ---------------- | --------------------------------- | --------------------------------------- |
| `report_id`    | INT (Primary Key, Auto Increment) | Unique identifier for each report       |
| `user_id`      | INT (Foreign Key)                 | Reference to the `users`table         |
| `start_date`   | DATE                              | Start date for the report period        |
| `end_date`     | DATE                              | End date for the report period          |
| `generated_at` | TIMESTAMP                         | Timestamp when the report was generated |

---

### **Technologies and Tools**

1. **Frontend** :

* **HTML** ,  **CSS** , **JavaScript** (Basic frontend)
* **Bootstrap** for responsive design
* **Chart.js** or **Google Charts** for visualizing expense data

1. **Backend** :

* **PHP** for server-side processing
* **MySQL** for relational database management

1. **Authentication** :

* Use **PHP sessions** for user authentication and session management
* **Password hashing** using **bcrypt**

1. **Payment Integration** (Optional):
   * Integrate payment gateways (PayPal, Stripe) for premium user features or subscription plans.
2. **Email Integration** :

* Use **PHP mailer** or **SendGrid** for password recovery and user notifications.

---

### **Security Considerations**

1. **Password Security** : Use secure password hashing and salting techniques such as bcrypt.
2. **SQL Injection Prevention** : Use **prepared statements** and **parameterized queries** in SQL queries to avoid SQL injection vulnerabilities.
3. **Input Validation** : Sanitize and validate all user inputs to prevent cross-site scripting (XSS) and other malicious attacks.
4. **Access Control** : Implement role-based access control (RBAC) to ensure users and admins can only access their authorized features.
5. **Session Management** : Implement secure session management, including session timeout and token-based authentication if needed.

---

This detailed design covers the essential features of the  **Daily Expense Tracker System (DETS)** , along with a secure database schema and technology stack. If you need more specific implementation details or additional features, feel free to ask!
