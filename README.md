<<<<<<< HEAD
# Workflow Builder App

A powerful GenAI workflow builder that allows you to create, configure, and test AI-powered workflows with drag-and-drop components. Build complex AI pipelines with components like Knowledge Base, LLM engines, Web Search, and more.

## 🚀 Features

- **Visual Workflow Builder**: Drag-and-drop interface for creating AI workflows
- **Knowledge Base Integration**: Upload and process PDF documents with ChromaDB
- **LLM Support**: Connect to OpenAI GPT models and Google Gemini
- **Web Search Integration**: Add web search capabilities to your workflows
- **Real-time Testing**: Test individual components and entire workflows
- **Modern UI**: Built with React and TypeScript for a smooth user experience

## 🏗️ Architecture

- **Frontend**: React + TypeScript + ReactFlow
- **Backend**: FastAPI + Python
- **Database**: ChromaDB for vector storage
- **AI Models**: OpenAI GPT, Google Gemini, Sentence Transformers

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd workflow-builder-app
```

### 2. Backend Setup

Navigate to the backend directory and set up the Python environment:

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

## 🚀 Running the Application

### Start the Backend Server

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

The backend will start on `http://localhost:8000`

### Start the Frontend Development Server

```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Google AI Configuration
GOOGLE_API_KEY=your_google_api_key_here

# Database Configuration (if using PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost/dbname
```

### API Keys Setup

1. **OpenAI API Key**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Google AI Key**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## 📖 Usage Guide

### Creating Your First Workflow

1. **Start the Application**: Make sure both backend and frontend are running
2. **Access the Builder**: Navigate to `http://localhost:3000`
3. **Add Components**: Drag components from the left panel to the canvas
4. **Configure Components**: Click on components to configure their settings
5. **Connect Components**: Draw connections between components to create workflows
6. **Test Your Workflow**: Use the "Test Chat" button to test your workflow

### Available Components

- **User Query**: Entry point for user questions
- **Knowledge Base**: Upload and search PDF documents
- **LLM (OpenAI)**: Connect to GPT models for text generation
- **Web Search**: Search the web for additional information
- **Output**: Display final results

### Component Configuration

Each component has specific configuration options:

- **Knowledge Base**: Upload PDF files, select embedding models
- **LLM**: Choose models (GPT-4, GPT-3.5, Gemini), set temperature, configure prompts
- **Web Search**: Select search engines, configure API keys

## 🧪 Testing

### Backend Testing

```bash
cd backend
source venv/bin/activate
python -m pytest  # If you have pytest installed
```

### Frontend Testing

```bash
cd frontend
npm test
```

## 📁 Project Structure

```
workflow-builder-app/
├── backend/
│   ├── app/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   ├── chroma_data/         # ChromaDB storage
│   ├── main.py             # FastAPI application entry point
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/          # React components
│   │   └── App.tsx         # Main application component
│   ├── package.json        # Node.js dependencies
│   └── public/             # Static assets
└── README.md
```

## 🔌 API Endpoints

### Knowledge Base
- `POST /kb/upload` - Upload PDF files
- `GET /kb/search` - Search knowledge base
- `DELETE /kb/collections/{collection_id}` - Delete collection

### LLM Engine
- `POST /llm/query` - Send queries to LLM
- `GET /llm/models` - Get available models

### Workflow
- `POST /workflow/execute` - Execute workflow
- `GET /workflow/status/{workflow_id}` - Get workflow status

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend is running on port 8000 and frontend on port 3000
2. **API Key Issues**: Verify your API keys are correctly set in the environment variables
3. **Port Conflicts**: Make sure ports 3000 and 8000 are available
4. **Python Dependencies**: Ensure all requirements are installed in the virtual environment

### Debug Mode

Use the "Debug Config" button in the LLM component to check configuration values.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [ReactFlow](https://reactflow.dev/) for the workflow visualization
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [ChromaDB](https://www.trychroma.com/) for vector storage
- [Lucide React](https://lucide.dev/) for icons

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/workflow-builder-app/issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

---

**Happy Building! 🚀**
=======
# Assignment
This is all about the full stack engineering assignment
>>>>>>> 421724f4f187e004f693cbd5a66d3c72dfea0485
