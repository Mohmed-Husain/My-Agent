# 🤖 My Agent — Mohmed Husain Pasheriya (AI Portfolio Agent)

> An interactive portfolio experience where visitors talk directly to an AI digital twin of **Mohmed Husain Pasheriya**, powered by **DeepSeek AI**, **FastAPI**, **Next.js 14**, and **Aiven PostgreSQL**.

[![Backend CI](https://github.com/Mohmed-Husain/My-Agent/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/Mohmed-Husain/My-Agent/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/Mohmed-Husain/My-Agent/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/Mohmed-Husain/My-Agent/actions/workflows/frontend-ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 Highlights

- 🗣️ **Conversational Digital Twin**: Speaks naturally as Mohmed Husain Pasheriya (AI Systems Engineer & Backend Developer @ Quba Infotech, 4th-year CS @ IIIT Vadodara '27).
- 🎭 **Animated Cyber Avatar**: Reacts dynamically to conversation state (`idle` breathing, `thinking` holographic scanner, `talking` sound waves).
- 🃏 **Structured Interactive Cards**: The LLM calls typed tools to render rich UI cards for:
  - **Featured Projects**: CleaniSense (Google Hackathon Winner), AI Meeting Assistant (Qdrant RAG), LeapSQL-AI (3-Agent LangGraph), Trading Alert Engine.
  - **Honors & Achievements**: Google Build with AI 2nd Runner-Up, IEEE Clinical NLP Publication Abstract, Postman Student Expert.
  - **Work Experience**: Quba Infotech, IIIT Vadodara research, Glynac AI.
  - **Live GitHub Repos**: Fetched from `@Mohmed-Husain` with star & fork counts.
  - **Interactive Questions**: Follow-up option pills visitors can click to guide the conversation.
- 🧠 **Session-Based Memory**: Persists conversation history across visits in PostgreSQL.
- 📊 **Visitor Analytics & Question Tracking**: Stores what visitors ask the agent in real time, categorized by topic.
- ☁️ **Cloud Native**: Deploy Frontend on **Vercel** and Backend on **Render**.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    User["👤 Visitor"] -->|"Web Browser"| Next["⚡ Next.js 14 (Vercel)"]
    Next -->|"Interactive UI + Framer Motion"| Avatar["🎭 Animated Digital Twin Avatar"]
    Next -->|"SSE Stream / REST"| FastAPI["🐍 FastAPI (Render)"]
    
    subgraph Backend["FastAPI Backend Orchestrator"]
        FastAPI --> Orch["Conversation Orchestrator"]
        Orch --> LLM["DeepSeek AI Client (Tool Calling)"]
        Orch --> Tools["Knowledge & Tool Execution Engine"]
        Orch --> Memory["Session & Question Logger"]
    end

    LLM -->|"Reasoning & Tool Invocation"| Tools
    Tools -->|"Structured JSON Cards"| Orch
    Memory -->|"Persist Chats & Visitor Questions"| Aiven["🐘 Aiven PostgreSQL / Fallback SQLite"]
    Tools -->|"Public Profile Data"| GitHub["🐙 GitHub REST API"]
    
    Orch -->|"SSE Chunks: Text + Cards + Options"| Next
```

---

## 📂 Repository Structure

```
My-Agent/
├── frontend/                        # Next.js 14 App Router (Vercel)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # Global theme & OpenGraph metadata
│   │   │   ├── page.tsx             # Landing page with Avatar & Split Chat UI
│   │   │   └── globals.css          # Cyber dark styling & scrollbar
│   │   ├── components/
│   │   │   ├── Avatar.tsx           # State-reactive digital avatar
│   │   │   ├── ChatInterface.tsx    # Streaming chat with quick prompts
│   │   │   ├── CardRenderer.tsx     # Card type dispatcher
│   │   │   └── cards/               # ProjectCard, AchievementCard, etc.
│   │   └── lib/
│   │       ├── api.ts               # SSE stream reader
│   │       └── types.ts             # TypeScript schemas
│   ├── package.json
│   └── tailwind.config.ts
│
├── backend/                         # FastAPI Orchestrator (Render)
│   ├── app/
│   │   ├── main.py                  # App entrypoint & CORS
│   │   ├── config.py                # Pydantic settings & DB URL parser
│   │   ├── core/
│   │   │   ├── orchestrator.py      # Session memory & question tracking
│   │   │   ├── llm.py               # DeepSeek client + streaming generator
│   │   │   ├── prompts.py           # Authentic persona system prompt
│   │   │   └── tools.py             # OpenAI/DeepSeek function calling tools
│   │   ├── db/
│   │   │   ├── database.py          # Async SQLAlchemy engine with SQLite fallback
│   │   │   └── models.py            # Session, Message, VisitorQuestion models
│   │   └── api/routes/
│   │       ├── chat.py              # POST /api/v1/chat (SSE) & /history
│   │       ├── admin.py             # GET /api/v1/admin/analytics & reset DB
│   │       ├── portfolio.py         # Direct knowledge endpoints
│   │       └── health.py            # Health check endpoint
│   ├── data/                        # JSON knowledge base (projects, achievements, repos)
│   ├── Dockerfile
│   ├── render.yaml                  # 1-Click Render blueprint
│   └── requirements.txt
│
├── .github/workflows/               # GitHub Actions CI pipelines
│   ├── frontend-ci.yml
│   └── backend-ci.yml
├── docker-compose.yml               # Local PostgreSQL + Backend
├── .env.example
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **Python**: 3.11+
- **DeepSeek API Key**: (Get one at [platform.deepseek.com](https://platform.deepseek.com))

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure .env
cp .env.example .env
# Open .env and insert your DEEPSEEK_API_KEY

# Start backend server
uvicorn app.main:app --reload --port 8000
```
Backend will start on: `http://localhost:8000`  
Interactive Swagger docs: `http://localhost:8000/docs`

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend

# Install dependencies
npm install

# Start Next.js dev server
npm run dev
```
Frontend will start on: `http://localhost:3000`

---

## ☁️ Deployment Guide

### Deploy Backend on Render
1. Create a free account on [Render.com](https://render.com).
2. Connect your GitHub repository: `https://github.com/Mohmed-Husain/My-Agent.git`.
3. Choose **Blueprint** deployment using `backend/render.yaml`, or create a **Web Service**:
   - **Root Directory**: `backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set Environment Variables in Render:
   - `DEEPSEEK_API_KEY`: Your key from DeepSeek
   - `DATABASE_URL`: `postgres://avnadmin:...@pg-...aivencloud.com:13480/defaultdb?sslmode=require`
   - `ADMIN_SECRET`: Secret passphrase for admin analytics

### Deploy Frontend on Vercel
1. Go to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import `My-Agent`.
3. Set **Root Directory** to `frontend`.
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g., `https://my-agent-backend.onrender.com`)
5. Click **Deploy**! 🚀

---

## 📊 Visitor Analytics & Question Tracking

Mohmed can see exactly what people are asking his agent:
- Open the web UI and click **"Visitor Insights"** in the top bar.
- Or access the endpoint:
  ```bash
  GET /api/v1/admin/analytics
  ```
  Returns:
  - Total visitor sessions & messages
  - Questions breakdown by topic (Projects, Hackathons, Experience, Hiring, Contact)
  - Exact list of user questions and timestamps

---

## 🧹 Database Reset

To drop and recreate all tables fresh (fulfilling cleanup requests):
```bash
POST /api/v1/admin/reset-db
```

---

## 📬 Contact & Links

- **Website**: [mohmed-husain.in](https://mohmed-husain.in/)
- **GitHub**: [@Mohmed-Husain](https://github.com/Mohmed-Husain)
- **LinkedIn**: [in/mohmed-husain](https://linkedin.com/in/mohmed-husain/)
- **Email**: [mohmedhusain72@gmail.com](mailto:mohmedhusain72@gmail.com)
