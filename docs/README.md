# Database Architecture (ERD)

This folder contains the technical documentation for the system's database structure.

## 🖼️ Schema Overview
![Database Schema](./Diagram(ERD).png)

## 📋 Table Descriptions
- **Users**: Handles authentication and roles (Admin/Manager).
- **Products**: Stores central inventory data, prices, and quantities.
- **Stock Movements**: Logs every entry (IN) and exit (OUT) of products.
- **Sales & Sale Items**: Manages transaction history and detailed itemized receipts.

## 🔗 Relationships
The system follows a centralized relational model where all users interact with a shared inventory, ensuring real-time updates across the dashboard.
