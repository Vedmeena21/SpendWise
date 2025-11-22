# 💰 Smart Expense Analyzer 

<div align="center">

![Smart Expense Analyzer](https://img.shields.io/badge/Smart-Expense%20Analyzer-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-1.0.0-orange)

A powerful full-stack web application that automates expense tracking by extracting and analyzing data from receipts using advanced OCR and NLP technologies.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Contributing](#-contributing)

</div>

## Live demo

Check out the live demo here: [Smart Expense Analyzer Live](https://smart-expense-analyser-frontend.onrender.com/)

## ✨ Overview

Smart Expense Analyzer transforms the way you manage expenses by automatically extracting and analyzing data from your receipts. Using cutting-edge OCR and NLP technologies, it converts physical or digital receipts into structured data, enabling effortless budget tracking and financial insights.

## 🚀 Features

- 📤 **Receipt Upload**
  - Support for images and PDFs
  - Real-time upload status

- 🔍 **Smart Data Extraction**
  - Merchant information
  - Total amount
  - Individual items and prices
  - Purchase date
  - Category classification

- 📊 **Analytics Dashboard**
  - Interactive expense charts
  - Category-wise breakdown
  - Monthly spending trends
  - Budget vs. actual analysis

- 💰 **Budget Management**
  - Set monthly budgets
  - Track spending limits
  - Receive alerts for overspending
  - Historical budget analysis

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| Frontend | Next.js, React, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB |
| AI/ML | Tesseract.js, BERT-based LayoutLM |
| Authentication | Clerk |
| Visualization | Chart.js, Recharts |

## 🏁 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Clerk account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/LakshayDhiman023/Smart-Expense-Analyser.git
   cd smart-expense-analyser
   ```

2. **Frontend Setup**
   ```bash
   cd client
   npm install
   ```

   Create `.env.local`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY= your-clerk0-publishable-key
    CLERK_SECRET_KEY=your-clerk-secret-key
   
   ```

3. **Backend Setup**
   ```bash
   cd ../server
   npm install
   ```

   Create `.env`:
   ```env
   MONGODB_URI = your-mongodb-uri 
    HUGGINGFACE_API_KEY = your-huggingface-api-key
   ```

4. **Start the Application**
   ```bash
   # Terminal 1 - Frontend
   cd client
   npm run dev

   # Terminal 2 - Backend
   cd server
   npm start
   ```

## 🔧 How It Works

1. **Authentication**
   - Secure login/signup via Clerk
   - OAuth, magic links, and email/password support

2. **Receipt Processing**
   - Upload receipt through intuitive UI
   - OCR processing with Tesseract.js
   - NER extraction using LayoutLM

3. **Data Management**
   - Structured data storage in MongoDB
   - User-specific data isolation
   - Real-time updates

4. **Analytics**
   - Interactive dashboard
   - Customizable reports
   - Budget tracking
   - Spending insights

## 🤝 Contributing

We welcome contributions! Please feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please:
- Open an issue in the GitHub repository
- Contact the maintainers
- Check the documentation

---

<div align="center">
Made with ❤️ by the Smart Expense Analyzer Team [Me]
</div>

