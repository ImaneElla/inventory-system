# Contributing to the Inventory System

Thank you for your interest in contributing! We welcome contributions from everyone. This document outlines the guidelines for how to contribute effectively and respectfully.

## 📌 Types of Contributions We Welcome

We appreciate various kinds of contributions, including but not limited to:

*   🛠️ **Code contributions** (bug fixes, performance improvements, new features)
*   🐞 **Bug reports**
*   💡 **Feature suggestions**
*   📚 **Improving documentation**

---

## 🐛 How to Report Bugs

When reporting a bug, please include the following:
*   A clear and descriptive title
*   Steps to reproduce the issue
*   Expected vs actual behavior
*   Environment info (OS, Java version, etc.)
*   Logs or screenshots if available

Use the **Bug Report** issue template when creating the issue.

---

## 💡 How to Suggest a Feature

To suggest a new feature:
1.  Search existing issues to avoid duplicates.
2.  If it's new, open a new issue using the `Feature Request` label.
3.  Describe your idea, use cases, and possible alternatives.

---

## 🔧 How to Contribute Code

### Step-by-Step Process

1.  **Fork** the repository.
2.  **Clone** your fork:
    ```bash
    git clone https://github.com/ImaneElla/inventory-system.git
    cd inventory-system
    ```
3.  **Create a feature branch**:
    ```bash
    git checkout -b my-feature
    ```
4.  **Build and Run the project**:
    *   **Prerequisites**: Java 21+, Maven, Bun (or Node.js).
    *   **Backend**: 
        ```bash
        cd backend
        ./mvnw spring-boot:run
        ```
    *   **Frontend**:
        ```bash
        cd frontend
        bun install
        bun run dev
        ```
5.  **Make your changes** and commit them.
6.  **Push your branch**:
    ```bash
    git push origin my-feature
    ```
7.  **Open a Pull Request (PR)** against the `main` branch.
8.  Respond to review comments and update your PR as needed.

---

## 🧹 Coding Style & Guidelines

*   Follow existing code conventions.
*   Run linters/formatters before committing.
*   Write unit tests for any new or changed logic.
*   Keep your changes minimal and focused.

---

## ✅ Commit Message Guidelines

Use the following format:
`<type> <short summary>`

Common types:
*   **Add**: New feature
*   **Fix**: Bug fix
*   **Update**: Code update
*   **Docs**: Documentation changes

---

Thank you again for helping us improve this project! 🙌 If you have any questions, open an issue or join the discussion.
