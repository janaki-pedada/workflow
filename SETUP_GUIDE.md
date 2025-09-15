# 🚀 Workflow Builder - Setup & Testing Guide

## ✅ What I Fixed

I've identified and fixed several issues in your code:

### 🔧 Backend Issues Fixed:
1. **LLM Service**: Added proper prompt construction and API key handling
2. **Workflow Route**: Now accepts custom API keys, models, and prompts
3. **Error Handling**: Better error messages and API key restoration

### 🎨 Frontend Issues Fixed:
1. **Configuration Storage**: StackBuilder now saves workflow configuration globally
2. **Chat Integration**: ChatInterface now uses the saved configuration
3. **ReactFlow Imports**: Fixed import issues for better TypeScript support

## 🛠️ How to Test Your Fixed Application

### Step 1: Start the Backend
```bash
cd Assignment/backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

### Step 2: Start the Frontend
```bash
cd Assignment/frontend
npm start
```

### Step 3: Test Backend (Optional)
```bash
cd Assignment
python test_backend.py
```

## 📋 Complete Workflow Testing

### 1. Upload a PDF
1. Open `http://localhost:3000`
2. Go to Stack Builder
3. Add a "Knowledge Base" component
4. Click on it and upload a PDF file
5. Wait for "PDF processed successfully!" message

### 2. Configure LLM
1. Add an "LLM (OpenAI)" component
2. Click on it and configure:
   - **Model**: Choose "Gemini-1.5-flash" (or your preferred model)
   - **API Key**: Enter your Gemini API key
   - **Prompt**: Use the default or customize it
3. Click "Test Connection" to verify it works

### 3. Save Configuration
1. Click "Test Chat" button
2. This will save your workflow configuration
3. You should see "Workflow configuration saved!" message

### 4. Test Chat
1. You'll be taken to the Chat Interface
2. Ask a question about your uploaded PDF
3. The system will:
   - Search the PDF for relevant information
   - Use your configured LLM to answer
   - Show the response

## 🔍 What Happens Behind the Scenes

### When you upload a PDF:
1. File is saved temporarily
2. Text is extracted from PDF
3. Text is split into chunks
4. Each chunk gets an embedding (vector representation)
5. Everything is stored in ChromaDB
6. Collection name is returned to frontend

### When you ask a question:
1. Your question gets an embedding
2. System searches ChromaDB for similar chunks
3. Relevant chunks become "context"
4. Context + your question + your custom prompt → LLM
5. LLM generates answer using your API key and model
6. Answer is returned to chat interface

## 🐛 Troubleshooting

### "Please configure your workflow first"
- Make sure you added and configured an LLM component
- Click "Test Chat" to save the configuration

### "Please upload a PDF first"
- Upload a PDF using the Knowledge Base component
- Wait for the success message

### "Error calling Gemini LLM"
- Check your API key is correct
- Make sure you have internet connection
- Verify the model name is correct

### CORS Errors
- Make sure backend is running on port 8000
- Make sure frontend is running on port 3000

## 🎯 Expected Behavior

✅ **PDF Upload**: Should show "PDF processed successfully!"  
✅ **LLM Test**: Should show "LLM connection successful!"  
✅ **Chat**: Should answer questions using PDF content + Gemini API  
✅ **Fallback**: If PDF doesn't have relevant info, Gemini still answers  

## 📝 API Keys Setup

### Get Gemini API Key:
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy the key (starts with "AIzaSy...")
4. Use it in the LLM component configuration

### Optional - Environment Variables:
Create `Assignment/backend/.env`:
```
GEMINI_API_KEY=your_api_key_here
```

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ PDF uploads successfully
- ✅ LLM test connection works
- ✅ Chat answers questions about your PDF
- ✅ Console shows proper request/response logs

## 🔄 Next Steps

Once everything works:
1. Try different PDFs
2. Experiment with custom prompts
3. Test different models
4. Add more components to your workflow

---

**Your workflow should now work exactly as intended: PDF → Knowledge Base → LLM → Answer! 🚀**