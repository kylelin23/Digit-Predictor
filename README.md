# AI Digit Guesser

## Project Description:
I built a full-stack web application that can accurately guess in real time what digit the user draws on a canvas. I used two different methods: 
1. Writing a Pytorch model trained on MNIST
2. Sending the image to Gemini API

**Technologies Used:**
-   **Frontend:** React, Vite
-   **Backend:** Node.js, Express.js, FastAPI
-   **Machine Learning:** Python, PyTorch
-   **AI API:** Google Gemini API

## How to Start
### Prerequisites
- Node.js
- Python

### Steps
1. **Clone the Repository**  
   ```bash
   git clone <your-repo-url>
   cd Digit-Guesser

2. **Install Dependencies**
   ```bash
   npm install # in frontend folder
   pip install torch torchvision uvicorn fastapi # in backend folder
   ```

3. **Start the Development Server**

   To use the model I wrote:
   ```bash
   cd frontend/self-made-model-frontend
   npm run dev
   ```
    
   To use the Gemini API: 
   ```bash
   cd frontend/gemini-made-model-frontend
   npm run dev
   ```
   
5. **Start the Backend**

   To use the model I wrote:
   ```bash
   cd backend/self-made-model
   uvicorn server:app --reload
   ```
    
   To use the Gemini API: 
   ```bash
   cd backend/gemini-made-model
   node server.js
   ```


## Screenshots
### Starting Page
<img width="500" alt="image" src="https://github.com/user-attachments/assets/41c3cbc0-318c-49b7-b624-8b0e5a1ddb09" />

### Guessing Page
<img width="500" alt="image" src="https://github.com/user-attachments/assets/1e9b94f5-c77f-4de9-9c8c-e32591bd9d81" />
