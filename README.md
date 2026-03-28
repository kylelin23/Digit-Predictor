# AI Digit Guesser

## Project Description:
I built a webpage that can accurately guess in real time what digit the user draws on a canvas using a Pytorch model trained on MNIST. 

**Technologies Used:**
React, Vite, Python, PyTorch

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
   npm install
   pip install torch torchvision
   pip install uvicorn
   pip install fastapi

3. **Start the Development Server**
   ```bash
   cd frontend
   npm run dev
   
4. **Start the Backend**
   ```bash
   cd backend
   uvicorn server:app --reload

## Screenshots
### Starting Page
<img width="500" alt="image" src="https://github.com/user-attachments/assets/41c3cbc0-318c-49b7-b624-8b0e5a1ddb09" />

### Guessing Page
<img width="500" alt="image" src="https://github.com/user-attachments/assets/1e9b94f5-c77f-4de9-9c8c-e32591bd9d81" />
